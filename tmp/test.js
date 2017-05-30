function some(cb) {
  cb()
}

function cb() {
  setTimeout(() => {
    throw new Error('cb error')
  }, 1000)
}

try{
  some(cb)
} catch(error) {
  console.log(error.message)
}
