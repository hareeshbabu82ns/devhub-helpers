import { useLoaderData } from "react-router-dom";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { useRef, useState } from "react";

// import { useDebounceEffect } from "../utils/useDebounceEffect";
import 'react-image-crop/dist/ReactCrop.css'

var tslib = require( 'tslib' );
// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth,
  mediaHeight,
  aspect,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

function limitArea( max, value ) {
  return Math.min( max, Math.max( 0, value ) );
}
function noOp( _max, value ) {
  return value;
}
function getRadianAngle( degreeValue ) {
  return degreeValue * Math.PI / 180;
}
/**
 * Returns the new bounding area of a rotated rectangle.
 */
function rotateSize( width, height, rotation ) {
  var rotRad = getRadianAngle( rotation );
  return {
    width: Math.abs( Math.cos( rotRad ) * width ) + Math.abs( Math.sin( rotRad ) * height ),
    height: Math.abs( Math.sin( rotRad ) * width ) + Math.abs( Math.cos( rotRad ) * height )
  };
}
/**
 * Compute the output cropped area of the media in percentages and pixels.
 * x/y are the top-left coordinates on the src media
 */
function computeCroppedArea( crop, mediaSize, cropSize, aspect, zoom, rotation, restrictPosition ) {
  if ( rotation === void 0 ) {
    rotation = 0;
  }
  if ( restrictPosition === void 0 ) {
    restrictPosition = true;
  }
  // if the media is rotated by the user, we cannot limit the position anymore
  // as it might need to be negative.
  var limitAreaFn = restrictPosition ? limitArea : noOp;
  var mediaBBoxSize = rotateSize( mediaSize.width, mediaSize.height, rotation );
  var mediaNaturalBBoxSize = rotateSize( mediaSize.naturalWidth, mediaSize.naturalHeight, rotation );
  // calculate the crop area in percentages
  // in the rotated space
  var croppedAreaPercentages = {
    x: limitAreaFn( 100, ( ( mediaBBoxSize.width - cropSize.width / zoom ) / 2 - crop.x / zoom ) / mediaBBoxSize.width * 100 ),
    y: limitAreaFn( 100, ( ( mediaBBoxSize.height - cropSize.height / zoom ) / 2 - crop.y / zoom ) / mediaBBoxSize.height * 100 ),
    width: limitAreaFn( 100, cropSize.width / mediaBBoxSize.width * 100 / zoom ),
    height: limitAreaFn( 100, cropSize.height / mediaBBoxSize.height * 100 / zoom )
  };
  // we compute the pixels size naively
  var widthInPixels = Math.round( limitAreaFn( mediaNaturalBBoxSize.width, croppedAreaPercentages.width * mediaNaturalBBoxSize.width / 100 ) );
  var heightInPixels = Math.round( limitAreaFn( mediaNaturalBBoxSize.height, croppedAreaPercentages.height * mediaNaturalBBoxSize.height / 100 ) );
  var isImgWiderThanHigh = mediaNaturalBBoxSize.width >= mediaNaturalBBoxSize.height * aspect;
  // then we ensure the width and height exactly match the aspect (to avoid rounding approximations)
  // if the media is wider than high, when zoom is 0, the crop height will be equals to image height
  // thus we want to compute the width from the height and aspect for accuracy.
  // Otherwise, we compute the height from width and aspect.
  var sizePixels = isImgWiderThanHigh ? {
    width: Math.round( heightInPixels * aspect ),
    height: heightInPixels
  } : {
    width: widthInPixels,
    height: Math.round( widthInPixels / aspect )
  };
  var croppedAreaPixels = tslib.__assign( tslib.__assign( {}, sizePixels ), {
    x: Math.round( limitAreaFn( mediaNaturalBBoxSize.width - sizePixels.width, croppedAreaPercentages.x * mediaNaturalBBoxSize.width / 100 ) ),
    y: Math.round( limitAreaFn( mediaNaturalBBoxSize.height - sizePixels.height, croppedAreaPercentages.y * mediaNaturalBBoxSize.height / 100 ) )
  } );
  return {
    croppedAreaPercentages: croppedAreaPercentages,
    croppedAreaPixels: croppedAreaPixels
  };
}

function ImageCrop() {

  const currentImage = useLoaderData();

  const imgRef = useRef( null )
  const [ crop, setCrop ] = useState( undefined )
  const [ completedCrop, setCompletedCrop ] = useState()
  const [ scale, setScale ] = useState( 1 )
  const [ rotate, setRotate ] = useState( 0 )
  const [ aspect, setAspect ] = useState( 16 / 9 )

  function onImageLoad( e ) {
    if ( aspect ) {
      const { width, height } = e.currentTarget
      // console.log( aspect, width, height )
      setCrop( centerAspectCrop( width, height, aspect ) )
    }
  }

  function handleToggleAspectClick() {
    if ( aspect ) {
      setAspect( undefined )
    } else if ( imgRef.current ) {
      const { width, height } = imgRef.current
      setAspect( 16 / 9 )
      setCrop( centerAspectCrop( width, height, 16 / 9 ) )
    }
  }

  const onOCRButton = async () => {
    const c = { x: completedCrop.x, y: completedCrop.y }
    const m = { width: imgRef.current.width, height: imgRef.current.height }
    const cs = { width: completedCrop.width, height: completedCrop.height }
    const { croppedAreaPercentages, croppedAreaPixels } = computeCroppedArea( c, m, cs, aspect, scale, rotate )
    // console.log( crop, completedCrop )
    // console.log( croppedAreaPercentages, croppedAreaPixels )
    // const croppedImageUrl = await getCroppedImg( imageUrl, croppedAreaPixels, rotation );
    // setCroppedImageFor( id, crop, zoom, aspect, rotation, croppedImageUrl );
    // await onOCR( { imageUrl, croppedImageUrl, croppedAreaPixels, rotation } )
  };

  return (
    <div>
      <div className="Crop-Controls">
        <div>
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={scale}
            onInput={( e ) => {
              setScale( Number( e.target.value ) )
            }}
          />
        </div>
        <div>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="range"
            min={0}
            max={360}
            step={0.5}
            value={rotate}
            onInput={( e ) => {
              setRotate( Math.min( 180, Math.max( -180, Number( e.target.value ) ) ) )
            }}
          />
        </div>
        <div>
          <button onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
          <button onClick={onOCRButton}>
            Read Text
          </button>
        </div>
      </div>
      <ReactCrop
        crop={crop}
        onChange={( _, percentCrop ) => setCrop( percentCrop )}
        onComplete={( c ) => setCompletedCrop( c )}
        aspect={aspect}
      >
        <img
          ref={imgRef}
          alt="Crop me"
          src={currentImage.imageUrl}
          className="imageImgd"
          style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
          onLoad={onImageLoad}
        />
      </ReactCrop>
    </div>
  )
}

export default ImageCrop