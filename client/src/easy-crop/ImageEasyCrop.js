import axios from "axios";
import React, { useState, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useLoaderData, useNavigate } from "react-router-dom";
import getCroppedImg from "./cropImage";
import './ImageUploadAndCrop.css'

const aspectRatios = [
  // { value: 1 / 3.5, text: "1/3" },
  { value: 1 / 2, text: "1/2" },
  { value: 4 / 3, text: "4/3" },
  { value: 16 / 9, text: "16/9" },
];

const ImageEasyCrop = () => {

  const currentImage = useLoaderData();
  const navigate = useNavigate()

  const [ isTextEditorVisible, setTextEditorVisible ] = useState( false );
  const [ ocrText, setOcrText ] = useState( '' );

  const [ zoom, setZoom ] = useState( 1.1 );
  const [ crop, setCrop ] = useState( { x: 0, y: 0 } );
  const [ aspect, setAspect ] = useState( aspectRatios[ 0 ] );
  const [ rotation, setRotation ] = useState( 0.5 );
  const [ croppedAreaPixels, setCroppedAreaPixels ] = useState( null );

  const onCropChange = ( crop ) => {
    setCrop( crop );
  };

  const onZoomChange = ( zoom ) => {
    setZoom( zoom );
  };

  const onRotationChange = ( rotation ) => {
    setRotation( rotation );
  };

  const onAspectChange = ( e ) => {
    const value = e.target.value;
    const ratio = aspectRatios.find( ( ratio ) => ratio.value == value );
    setAspect( ratio );
  };

  const onCropComplete = ( croppedArea, croppedAreaPixels ) => {
    setCroppedAreaPixels( croppedAreaPixels );
  };

  const onCrop = async () => {
    // console.log( zoom )
    const croppedImageUrl = await getCroppedImg( currentImage.imageUrl, croppedAreaPixels, rotation );
    // setCroppedImageFor( id, crop, zoom, aspect, rotation, croppedImageUrl );
  };

  const onOCR = async ( { imageUrl, croppedImageUrl, croppedAreaPixels, rotation } ) => {
    // const data = new FormData();
    // data.append( "file", this.state.selectedFile, this.state.selectedFile.name );
    try {
      const res = await axios.post( '/ocr/readFromBlobData', { imageUrl, croppedImageUrl, croppedAreaPixels, rotation } )
      // console.log( res.data.ocrText )
      setOcrText( res.data.ocrText + '\n----\n' + ocrText )
      navigator.clipboard.writeText( res.data.ocrText );
    } catch ( e ) {
      console.log( e )
    }

  }

  const onOCRButton = async () => {
    const croppedImageUrl = await getCroppedImg( currentImage.imageUrl, croppedAreaPixels, rotation );
    // setCroppedImageFor( id, crop, zoom, aspect, rotation, croppedImageUrl );
    await onOCR( { imageUrl: currentImage.imageUrl, croppedImageUrl, croppedAreaPixels, rotation } )
  };


  return (
    <div>
      <div className="backdrop"></div>
      <div className="crop-container">
        {isTextEditorVisible === false &&
          <Cropper
            image={currentImage.imageUrl}
            zoom={zoom}
            rotation={rotation}
            crop={crop}
            aspect={aspect.value}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropComplete}
          />}
        {isTextEditorVisible === true &&
          <textarea value={ocrText} onChange={( e ) => setOcrText( e.target.value )} />}
      </div>
      <div className="controls">
        <div className="controls-upper-area">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onInput={( e ) => {
              onZoomChange( e.target.value );
            }}
            className="slider"
          ></input>
          <input
            type="range"
            min={0}
            max={360}
            step={0.5}
            value={rotation}
            onInput={( e ) => {
              onRotationChange( e.target.value );
            }}
          ></input>
          <select onChange={onAspectChange}>
            {aspectRatios.map( ( ratio ) => (
              <option
                key={ratio.text}
                value={ratio.value}
                selected={ratio.value === aspect.value}
              >
                {ratio.text}
              </option>
            ) )}
          </select>
          <label>
            <input type="checkbox" checked={isTextEditorVisible}
              onChange={( e ) => setTextEditorVisible( !isTextEditorVisible )} />
            Text Editor
          </label>

        </div>
        <div className="button-area">
          {/* <button onClick={onCrop}>Crop</button> */}
          <button onClick={onOCRButton}>Read Text</button>
          <button onClick={() => navigate( -1 )}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImageEasyCrop;