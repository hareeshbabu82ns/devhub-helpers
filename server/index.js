const path = require( "path" );
const express = require( "express" );
const cors = require( 'cors' )
const fs = require( 'fs' );
const fileUpload = require( 'express-fileupload' );
const { pdf2pic, textractFromImg } = require( "./utils/ocr-utils" );
const { fetchCurrentImagesOfPDF } = require( "./utils/utils" );
const gm = require( 'gm' ).subClass( { imageMagick: '7+' } );

const PORT = process.env.PORT || 3001;

const app = express();

app.use( cors() )

app.use(
  fileUpload( {
    useTempFiles: true,
    safeFileNames: true,
    preserveExtension: true,
    tempFileDir: `${__dirname}/public/files/temp`
  } )
);

app.use( express.json() );

// Have Node serve the files for our built React app
app.use( express.static( path.resolve( __dirname, '../client/build' ) ) );

// serve files
app.use( '/uploads', express.static( __dirname + '/public' ) );

app.post( '/ocr/pdf2pic', async ( req, res, next ) => {

  // console.dir( req.body )
  const pdfPath = `${__dirname}/public/files/ocr_pdfs/${req.body.pdfFile}`
  const pdfPathObj = path.parse( pdfPath )
  // const outPathDir = req.body.outPath ?? path.dirname( pdfPath )
  const tempDir = `${__dirname}/public/files/temp/`
  // console.dir( pdfPathObj )

  // convert pdf to images
  const pics = await pdf2pic( {
    path: pdfPath,
    outPath: tempDir,
    filePrefix: pdfPathObj.name,
    // pageNumbers: [],
    pageNumbers: Array.from( { length: 10 }, ( v, idx ) => 80 + idx ),
    outFormat: "png"
  } )

  return res.status( 200 )
    .json( {
      status: 'pdf is converted to png',
      data: pics.map( ( { name, size, fileSize } ) => ( { name, size, fileSize } ) )
    } )
} )

app.post( '/uploadPDFOCR', ( req, res, next ) => {
  let uploadFile = req.files.file;
  // console.log( uploadFile )
  const name = uploadFile.name;
  const md5 = uploadFile.md5;
  const saveAs = `${md5}_${name}`;
  const filePath = `${__dirname}/public/files/ocr_pdfs/${saveAs}`
  uploadFile.mv( filePath, function ( err ) {
    if ( err ) {
      return res.status( 500 ).send( err );
    }
    return res.status( 200 ).json( { status: 'uploaded', name, saveAs } );
  } );
} );

const LANGS = [
  'eng',
  'tel',
  // 'san',
]

app.get( "/ocr/currentImages/:pdf", async ( req, res ) => {
  try {
    const tempDir = `${__dirname}/public/files/temp`
    const images = await fetchCurrentImagesOfPDF( { pdfFileName: req.params.pdf, tempDir } )
    return res.status( 200 ).json( { status: 'current images', images } )
  } catch ( err ) {
    console.log( err )
    return res.status( 500 ).send( err )
  }
} )

app.post( "/ocr/readFromBlobData", ( req, res ) => {
  // console.log( req.body )
  const { imageUrl, croppedAreaPixels, rotation } = req.body
  const tempFile = imageUrl.replace( '/uploads/files', `${__dirname}/public/files` )
  const ocrTmpFile = tempFile.replace( '.png', '.tmp.png' )

  gm( tempFile )
    .rotate( '#fff', rotation )
    .crop( croppedAreaPixels.width, croppedAreaPixels.height, croppedAreaPixels.x, croppedAreaPixels.y, false )
    .write( ocrTmpFile, async ( err ) => {
      if ( err ) {
        console.log( err )
        return res.status( 500 ).send( err );
      }
      const ocrText = await textractFromImg( { image: ocrTmpFile, langs: LANGS } )
      fs.rmSync( ocrTmpFile )
      return res.status( 200 ).json( { status: 'image cropped', ocrText } );
    } )
} );

// Handle GET requests to /api route
app.get( "/api", ( req, res ) => {
  res.json( { message: "Hello from server!" } );
} );

// All other GET requests not handled before will return our React app
app.get( '*', ( req, res ) => {
  res.sendFile( path.resolve( __dirname, '../client/build', 'index.html' ) );
} );

app.listen( PORT, () => {
  console.log( `Server listening on ${PORT}` );
} );
