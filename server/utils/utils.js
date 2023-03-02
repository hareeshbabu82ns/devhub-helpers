const fs = require( 'fs' )
const path = require( 'path' )

async function fetchCurrentImagesOfPDF( {
  pdfFileName,
  tempDir = `${__dirname}/public/files/temp`,
} ) {
  const files = fs.readdirSync( tempDir )
  // console.log( files )
  // files.forEach( file => {
  //   console.log( file );
  // } );
  return files.filter( f => f.startsWith( pdfFileName.split( '.pdf' )[ 0 ] ) )
}



module.exports = {
  fetchCurrentImagesOfPDF,
}