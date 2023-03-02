import {
  useLoaderData, useNavigate, useParams,
} from "react-router-dom";

function OcrPdfImages() {

  const { images } = useLoaderData();
  const navigate = useNavigate()
  const params = useParams()

  return (
    <div>
      {images.map( ( img ) => (
        <div className="imageImgd" key={img.id}>
          <p>{img.imageUrl}</p>
          <img
            src={img.croppedImageUrl ? img.croppedImageUrl : img.imageUrl}
            alt=""
            onClick={() => {
              // console.log( img.imageUrl );
              const imgName = img.imageUrl.split( '/' ).slice( -1 )
              // console.log( imgName );
              // setSelectedImg( img );
              navigate( `/ocr/easy-crop/${params.file}/imgCrop/${imgName}` )
            }}
          />

        </div>
      ) )}
    </div>
  )
}

export default OcrPdfImages