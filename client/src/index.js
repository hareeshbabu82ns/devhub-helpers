import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import OcrEasyCrop from './easy-crop/OcrEasyCrop';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";

import { getchCurrentImagesLoader, getchCurrentImageLoader } from "./ocr-utils/pdf-api"
import OcrPdfImages from './easy-crop/OcrPdfImages';
// import ImageCrop from './img-crop/ImageCrop';
import ImageEasyCrop from './easy-crop/ImageEasyCrop';

const router = createBrowserRouter( [
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/ocr/easy-crop",
        element: <OcrEasyCrop />,
      },
      {
        path: "/ocr/easy-crop/:file",
        element: <OcrPdfImages />,
        loader: getchCurrentImagesLoader,
      },

    ]
  },
  {
    path: "/ocr/easy-crop/:file/imgCrop/:imgFile",
    element: <ImageEasyCrop />,
    // element: <ImageCrop />,
    loader: getchCurrentImageLoader,
  },

] );

const root = ReactDOM.createRoot( document.getElementById( 'root' ) );
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
