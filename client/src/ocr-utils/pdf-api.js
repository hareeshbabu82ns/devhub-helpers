import axios from "axios";

const getchCurrentImages = async ( { file } ) => {
  try {
    const { data } = await axios
      .get( `/ocr/currentImages/${file}` )
    // console.log( data )
    const imgList = data.images.map( ( name, idx ) =>
      ( { id: idx + 1, imageUrl: `/uploads/files/temp/${name}`, croppedImageUrl: null } ) )

    return imgList
  } catch ( err ) {
    console.log( err )
  }
}

const getchCurrentImagesLoader = async ( { params } ) => {
  // console.log( params )
  const images = await getchCurrentImages( { file: params.file } );
  // console.log( images )
  return { images };
}

const getchCurrentImageLoader = async ( { params } ) => {
  // console.log( params )
  const images = await getchCurrentImages( { file: params.file } );
  // console.log( images )
  return images.find( ( { imageUrl } ) => imageUrl.endsWith( params.imgFile ) );
}

export { getchCurrentImages, getchCurrentImagesLoader, getchCurrentImageLoader }