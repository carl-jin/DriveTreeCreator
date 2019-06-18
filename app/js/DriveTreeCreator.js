/**
 * --------------------------------------------------------------------------
 * DriveTreeCreator.js
 * @description pretty easy way to create a ton of folder tree from google drive
 * @version 0.0.1
 * @license WTFPL
 * @author BUFF
 * --------------------------------------------------------------------------
 */
class DriveTreeCreator {
  constructor (options) {
    //  default options
    this.options = {
      googleAPI: {
        clientId: "",
        apiKey: "",
        /**
         which folder do you want to get from?
         accept multiple folder Id
         use , to segmentation
         like
         folderIdTest,folderIdTest2,folderIdTest3
         */
        folderId: "",
        /*
        the owner of the google folder
        that's a point of DriveTreeCreator working
        as we know , we cant get children folder or grandson folder
        by google drive api, cuz google not provide it
        but interestingly we can use the owner parameter to replace it!
        */
        owner: "",
      },
      scope: 'https://www.googleapis.com/auth/drive',
      discovery_docs: ["https://script.googleapis.com/$discovery/rest?version=v1"],
      //  list files except trash file
      inTrash: false,
      //  google drive api list parameter ---- files
      //  https://developers.google.com/drive/api/v3/search-files
      files: `id,name,size,createdTime,webContentLink,webViewLink,mimeType,parents,fileExtension`,
      //  google drive api list parameter
      //  https://developers.google.com/drive/api/v3/reference/files/list
      includeTeamDriveItems: false,
      //  sort file from dir view, accept a fn
      sort: null
    }
    this.options = Object.assign(this.options, options)
    
  }
  
  /**
   * a method from initialization google api environment
   * which mean u should call it after new DriveTreeCreator,immediately
   * and every method calling should after init finish
   * @returns {Promise<any>} when environment has been ready for roll
   */
  init () {
    return new Promise(async res => {
      if (window.gapi) {
        if (!window.gapi.client.script || !window.gapi.client.drive) {
          throw new Error('make sure gapi.client.script or gapi.client.drive has been set up, use gapi.load pls');
        } else {
          this._event()
          res()
        }
      } else {
        await this._loadGApi()
        this._event()
        res()
      }
    })
  }
  
  /**
   * subscribe event
   *
   * signInStateChange
   * loadProcess
   *
   * @private
   */
  _event () {
    //  user sign in state change
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(isSignedIn => this._emitEvent('signInStateChange', {state: isSignedIn}))
  }
  
  /**
   * manually emit an event
   * @private
   */
  _emitEvent (eventName, payload = {}) {
    if (!this.handlers) {
      return
    }
    
    let handlers = this.handlers[eventName]
    handlers && handlers.forEach(handler => handler(payload))
  }
  
  /**
   * get pop page to sign in google account
   */
  signIn () {
    return window.gapi.auth2.getAuthInstance().signIn({prompt: 'select_account'})
  }
  
  signOut () {
    return gapi.auth2.getAuthInstance().signOut()
  }
  
  /**
   * start to create tree view
   * @returns {Promise<any>}
   * steps:
   * 1. get all files by owners user
   * 2. createTree by files
   * 3. sort
   * 4. return specific folder from folderId parameter
   */
  start () {
    if (!this.isSignIn()) {
      throw new Error('cant run start method, should sign-in first')
    }
    
    return new Promise(async res => {
      //  step 1
      //  get all files by owners user
      this._emitEvent('loadProcess', {process: 'start', count: 0})
      let files = []
      if (window.location.href.indexOf('localhost') && false) {
        let cache = window.localStorage.getItem('filesCache')
        if (window.localStorage.getItem('filesCache')) {
          files = JSON.parse(cache)
        } else {
          files = await this._getAllFilesUnderRootFolder()
          window.localStorage.setItem('filesCache', JSON.stringify(files))
        }
      } else {
        files = await this._getAllFilesUnderRootFolder()
      }
      
      //   step 2
      //  createTree by files
      let dir = this._createTree(files)
      
      //  step 3
      //  sort
      if (!~this.options.files.indexOf('name')) {
        throw new Error('should include `name` field in options.files')
      }
      
      Object.keys(dir).map(key => {
        this._sort(dir[key])
      })
      
      //  step 4
      //  return specific folder from folderId parameter
      dir = Object.values(dir)
      
      
      let result = []
      this.options.googleAPI.folderId.split(',').map(id => result.push(this._returnSpecificFolder(dir, id)))
      res(result)
    })
  }
  
  /**
   * find specific folder from dir
   * @private
   */
  _returnSpecificFolder (dir, id) {
    for (let i = 0 ; i < dir.length ; i++) {
      if (dir[i].id === id) {
        return dir[i]
      } else {
        if (dir[i].children) {
          let res = this._returnSpecificFolder(dir[i].children, id)
          if (res) {
            return res
          }
        }
      }
    }
  }
  
  _sort (dir) {
    if (dir.children && dir.children.length > 0) {
      //  sort
      dir.children.sort((a, b) => this.options.sort ? this.options.sort(a, b) : a.name.localeCompare(b.name, 'zh'))
      dir.children.map(item => this._sort(item))
    }
  }
  
  /**
   * core !!!!!!!!!!!!!!!!!!!!!!!!!
   * generator three view by parents from each file
   * @param files
   * @private
   */
  _createTree (files) {
    let relationKeyPath = {}
    let newData = {}
    
    files.map(item => newData[item.id] = item)
    files = newData
    newData = null
    
    //  core
    Object.keys(files).map(key => {
      if (files[key].parents) {
        let parentId = files[key].parents[0]
        let item = files[key]
        
        if (files[parentId]) {
          if (files[parentId].children) {
            files[parentId].children.push(item)
          } else {
            files[parentId].children = [item]
          }
          
          relationKeyPath[key] = [parentId]
          delete files[key]
        } else {
          if (relationKeyPath[parentId]) {
            relationKeyPath[parentId] = this.__findKeyPath(parentId, relationKeyPath)
            let parentObj = null
            relationKeyPath[parentId].map(_parentId => {
              if (Array.isArray(parentObj)) {
                parentObj.map((__parentItem, __key) => {
                  if (__parentItem.id === _parentId) {
                    parentObj = parentObj[__key].children
                  }
                })
              } else {
                parentObj = files[_parentId].children
              }
            })
            
            parentObj.map(___item => {
              if (___item.id === parentId) {
                if (___item.children) {
                  ___item.children.push(item)
                } else {
                  ___item.children = [item]
                }
              }
            });
            relationKeyPath[key] = [parentId]
            delete files[key]
          }
        }
      }
    })
    
    return files
  }
  
  __findKeyPath (key, relationPath, arr = []) {
    if (relationPath[key]) {
      arr = relationPath[key].concat(arr)
      return this.__findKeyPath(arr[0], relationPath, arr)
    } else {
      return arr
    }
  }
  
  /**
   * get all files by owners user
   * @param nextPageToken
   * @param data
   * @param count
   * @returns {Promise<any>}
   * @private
   */
  _getAllFilesUnderRootFolder (nextPageToken = '', data = [], count = 1) {
    return new Promise(res => {
      window.gapi.client.drive.files.list({
        pageSize: 1000,
        pageToken: nextPageToken,
        spaces: 'drive',
        q: `'${this.options.googleAPI.owner}' in owners and trashed = ${this.options.inTrash.toString()}`,
        fields: `nextPageToken, files(${this.options.files})`,
        includeTeamDriveItems: this.options.includeTeamDriveItems
      }).then(result => {
        data = data.concat(result.result.files)
        //  emit event
        this._emitEvent('loadProcess', {process: count, count: result.result.files.length})
        count++
        if (result.result.nextPageToken) {
          res(this._getAllFilesUnderRootFolder(result.result.nextPageToken, data, count))
        } else {
          this._emitEvent('loadProcess', {process: 'down', count: data.length})
          res(data)
        }
      });
    });
  }
  
  /**
   * check user Sign In state
   */
  isSignIn () {
    return window.gapi.auth2.getAuthInstance().isSignedIn.get()
  }
  
  /**
   * Attach a handler function for an event.
   * @param eventName
   * @param handler
   */
  on (eventName, handler) {
    let self = this
    if (!this.handlers) {
      this.handlers = {}
    }
    
    let handlers = this.handlers[eventName];
    
    if (!handlers) {
      handlers = this.handlers[eventName] = []
    }
    
    handlers.push(handler)
    
    // Return an event descriptor
    return {
      name: eventName,
      callback: handler,
      un: (e, fn) => self.un(e, fn)
    }
  }
  
  /**
   * Remove an event handler.
   * @param eventName
   * @param handle
   */
  un (eventName, handle) {
    if (!this.handlers) {
      return
    }
    
    let handlers = this.handlers[eventName]
    let i
    
    if (handlers) {
      if (handle) {
        for (i = handlers.length - 1 ; i >= 0 ; i--) {
          handlers[i] == handle && handlers.splice(i, 1)
        }
      } else {
        handlers.length = 0
      }
    }
  }
  
  /**
   * get user information from current sign in
   */
  getCurrentUser () {
    let userProfile = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile()
    return userProfile ? {
      email: userProfile.getEmail(),
      name: userProfile.getName(),
      image: userProfile.getImageUrl(),
      id: userProfile.getId(),
      token: window.gapi.auth.getToken().access_token
    } : {}
  }
  
  /**
   * load google sdk
   * @private
   */
  _loadGApi () {
    return new Promise(async res => {
      await this._loadScript('https://apis.google.com/js/api.js')
      window.gapi.load('client:auth2', () => {
        window.gapi.client.load('drive', 'v3', async () => {
          await window.gapi.client.init({
            apiKey: this.options.googleAPI.apiKey,
            clientId: this.options.googleAPI.clientId,
            discoveryDocs: this.options.discovery_docs,
            scope: this.options.scope
          })
          res()
        })
      })
    })
  }
  
  /**
   * same as $.loadScript()
   * @param src
   * @returns {Promise<any>}
   * @private
   */
  _loadScript (src) {
    return new Promise((res, rej) => {
      let script = document.createElement('script')
      script.async = true
      script.onerror = () => rej()
      script.onload = () => res(src)
      script.src = src
      document.querySelector('body').appendChild(script)
    })
  }
  
}

export default DriveTreeCreator
