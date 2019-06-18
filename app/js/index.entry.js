import DriveTreeCreator from './DriveTreeCreator'

document.querySelector('#start').addEventListener('click', async () => {
  let D = new DriveTreeCreator({
    googleAPI: {
      clientId: clientId.value,
      apiKey: apiKey.value,
      folderId: folderId.value,
      owner: owner.value
    }
  })
  
  await D.init()
  
  //  loading state change
  D.on('signInStateChange', payload => {
    console.log(payload)
  })
  
  //  loading process
  D.on('loadProcess', payload => {
    console.log(payload)
  })
  
  !D.isSignIn() && await D.signIn()
  
  console.time('start')
  let data = await D.start()
  console.timeEnd('start')
  console.log(data)
})

