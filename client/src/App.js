// import React from "react"

// function App() {
//   const [ data, setData ] = React.useState( null )

//   React.useEffect( () => {
//     fetch( '/api' ).then( res => res.json() )
//       .then( d => setData( d.message ) )
//   }, [] )

//   return (
//     <div>
//       <p>{!data ? "Loading..." : data}</p>
//     </div>
//   )
// }

// export default App

import "./App.css";
import { React, useState } from "react";
import ImageCropDialog from "./ImageCropDialog";
import FileUploader from "./FileUploader"
import axios from "axios";

// const initData = Array.from( { length: 10 }, ( v, idx ) => ( { id: idx + 1, imageUrl: `images/tel_dict.${80 + idx}.png`, croppedImageUrl: null } ) )
// const initData = Array.from( { length: 10 }, ( v, idx ) => ( { id: idx + 1, imageUrl: `/uploads/files/temp/8e881068a19ea7f442f4a9c1fd658cd5_tel_dict.${80 + idx}.png`, croppedImageUrl: null } ) )
const initData = []

function App() {
  const [ imgs, setImgs ] = useState( initData );
  const [ selectedImg, setSelectedImg ] = useState( null );
  const [ uploadedFile, setUploadedFile ] = useState( null )

  const onCancel = () => {
    setSelectedImg( null );
  };

  const setCroppedImageFor = ( id, crop, zoom, aspect, rotation, croppedImageUrl ) => {
    const newImgsList = [ ...imgs ];
    const imgIndex = imgs.findIndex( ( x ) => x.id === id );
    const img = imgs[ imgIndex ];
    const newImg = { ...img, croppedImageUrl, crop, zoom, aspect, rotation };
    newImgsList[ imgIndex ] = newImg;
    setImgs( newImgsList );
    setSelectedImg( null );
  };

  const resetImage = ( id ) => {
    setCroppedImageFor( id );
  };

  const convPDFtoPNG = ( event ) => {
    event.preventDefault();
    // console.log( uploadedFile )
    const data = { pdfFile: uploadedFile.saveAs }
    axios
      .post( '/ocr/pdf2pic', data )
      .then( res => {
        // console.log( res.data )
        // console.log( initDataTmp )
        const imgList = res.data.data.map( ( { name }, idx ) =>
          ( { id: idx + 1, imageUrl: `/uploads/files/temp/${name}`, croppedImageUrl: null } ) )
        setImgs( imgList )
        // setImgs( initDataTmp )
      } )
      .catch( err => {
        console.log( err )
      } );
  }

  const onOCR = async ( { imageUrl, croppedImageUrl, croppedAreaPixels, rotation } ) => {
    // const data = new FormData();
    // data.append( "file", this.state.selectedFile, this.state.selectedFile.name );
    try {
      const res = await axios.post( '/ocr/readFromBlobData', { imageUrl, croppedImageUrl, croppedAreaPixels, rotation } )
      console.log( res.data.ocrText )
      navigator.clipboard.writeText( res.data.ocrText );
    } catch ( e ) {
      console.log( e )
    }

  }

  return (
    <div>
      <div>
        <FileUploader onFileUploaded={( f ) => setUploadedFile( f )} />
        <div>
          {uploadedFile && <button type='button' onClick={convPDFtoPNG} >convert to image</button>}
        </div>
      </div>
      <div>
        {selectedImg ? (
          <ImageCropDialog
            id={selectedImg.id}
            imageUrl={selectedImg.imageUrl}
            cropInit={selectedImg.crop}
            zoomInit={selectedImg.zoom}
            aspectInit={selectedImg.aspect}
            onCancel={onCancel}
            setCroppedImageFor={setCroppedImageFor}
            resetImage={resetImage}
            onOCR={onOCR}
          />
        ) : null}
        {imgs.map( ( img ) => (
          <div className="imageImgd" key={img.id}>
            <img
              src={img.croppedImageUrl ? img.croppedImageUrl : img.imageUrl}
              alt=""
              onClick={() => {
                console.log( img );
                setSelectedImg( img );
              }}
            />
          </div>
        ) )}
      </div>
    </div>
  );
}

export default App;