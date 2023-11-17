import React, { useEffect, useState, useCallback, useRef } from "react";
import "./componentscss/Table.css";
import YES from "./YES";
import NO from "./NO";
import "./componentscss/Toggle.css";
import LoadingAnimation from "./LoadingAnimation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { quant_viz_logo } from "../Images/QuantVizLogo";
// import ImageRows from './ImageRows';
// import { TableDataProvider } from './TableDataContext';
// import Topbar from './Topbar';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// import { useReactToPrint } from 'react-to-print';
// import { useSelectedCage } from './SelectedCageContext';
// import Toggle from './Toggle';

import html2pdf from "html2pdf.js";

export default function Table({
  selectedDate,
  selectedCage,
  setSelectedCage,
  formattedDate,
  setFormattedDate,
  selectedShift,
  onDownload,
  fromDate,
  toDate,
}) {
  // state and setState function to store and update state respectively. imgURLs store the array of image urls.
  const [imgURLs, setImgURLs] = useState([]);
  const [filteredImageURLs, setFilteredImageURLs] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [isDataFilled, setIsDataFilled] = useState(false);
  // const [baseImgArr,setBaseImgArr]=useState([]);
  const pdfRef = useRef(null);
  // const [selectedDefects, setSelectedDefects] = useState({});

  // const componentPDF = useRef();

  // triggers when the component first mounts, to display today's(current date's) data, with cage 24 as default
  // setting the initial state of the formattedDate to todays date
  useEffect(() => {
    const currentDate = new Date();
    const todayYear = currentDate.getFullYear();
    const todayMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // padding required to match format with backend
    const todayDay = currentDate.getDate().toString().padStart(2, "0"); // padding required to match format with backend

    const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

    setFormattedDate(todayDate);
  }, [setFormattedDate]);
  console.log(formattedDate);

  const fetchImgURLs = useCallback(async () => {
    try {
      let imageUrl = "";
      let imageUrls = []; // array to store image urls from all cages

      if (selectedCage === "All") {
        const listDevices = ["jetson1", "jetson2", "jetson3"];
        for (let device of listDevices) {
          imageUrl = `http://localhost:7000/images/${device}/${formattedDate}/`;
          // imageUrl =`http://3.7.70.110:7000/images/${device}/${formattedDate}/`;
          const response = await fetch(imageUrl);
          const data = await response.json();
          const filteredImages = data.images.filter(
            (image) => !image.endsWith("/")
          );
          imageUrls = imageUrls.concat(filteredImages);
        }
        console.log(imageUrls);
        console.log(imageUrl);
      } else {
        const jetsonName =
          selectedCage === "Cage 12"
            ? "jetson1"
            : selectedCage === "Cage 18"
            ? "jetson2"
            : "jetson3";
        console.log(jetsonName);
        // imageUrl = `http://3.7.70.110:8080/images/${jetsonName}/${formattedDate}/`;
        imageUrl = `http://localhost:7000/images/${jetsonName}/${formattedDate}/`;
        const response = await fetch(imageUrl);
        const data = await response.json();
        const filteredImages = data.images.filter(
          (image) => !image.endsWith("/")
        );
        imageUrls = filteredImages;
      }

      setImgURLs(imageUrls);
    } catch (error) {
      console.error("Error Fetching Images", error);
    }
  }, [selectedCage, formattedDate]);

  // triggers fetchimgURLs function
  useEffect(() => {
    if (formattedDate && formattedDate !== "undefined") {
      fetchImgURLs();
    }
  }, [formattedDate, fetchImgURLs]);

  // function to filter images based on shift
  const filterImagesByShift = useCallback(() => {
    if (!selectedShift || selectedShift === "All") {
      setFilteredImageURLs(imgURLs);
      return;
    }
    const shiftStartTimes = {
      "Shift 1": 7,
      "Shift 2": 15,
      "Shift 3": 23,
    };
    const selectedShiftStartHour = shiftStartTimes[selectedShift];
    console.log(selectedShiftStartHour);
    const selectedShiftEndHour = (selectedShiftStartHour + 8) % 24;

    const filteredImages = imgURLs.filter((imgURL) => {
      const Imgparts = imgURL.split("/");
      const ImgfileName = Imgparts[Imgparts.length - 1];
      const Imgtimestamp = ImgfileName.split("_")[0]
        .split("-")
        .slice(-3)
        .join(":");
      console.log(Imgtimestamp);

      const hour = parseInt(Imgtimestamp.split(":")[0]);
      console.log(hour);
      console.log(selectedShiftStartHour);
      if (selectedShiftStartHour < selectedShiftEndHour) {
        return hour >= selectedShiftStartHour && hour < selectedShiftEndHour;
      } else {
        // Handle the case where the shift spans across midnight
        return hour >= selectedShiftStartHour || hour < selectedShiftEndHour;
      }
    });
    console.log("Filtered Images:", filteredImages);
    setFilteredImageURLs(filteredImages);
  }, [imgURLs, selectedShift]);
  console.log(filteredImageURLs);
  useEffect(() => {
    filterImagesByShift();
  }, [filterImagesByShift]);
  useEffect(() => {
    if (formattedDate && formattedDate !== "undefined") {
      fetchImgURLs();
    } else {
      // Set filtered images to empty array when formattedDate is not available
      setFilteredImageURLs([]);
    }
  }, [formattedDate, fetchImgURLs]);
  const cageNameMappings = {
    jetson1: "Cage 12",
    jetson2: "Cage 18",
    jetson3: "Cage 24",
  };
  const transformedData = [];
  let baseImgArr = [];
  let bodyData = [];
  let image = "";

  // Define image compression parameters
  const maxWidth = 640; // Adjust this value as needed
  const maxHeight = 70; // Adjust this value as needed
  const quality = 0.5; // Adjust the quality as needed (0.0 to 1.0)

  // // Loop through the filtered image URLs
  const fetchData = async () => {
    try {
      const promises = [];  
      const dataWithBase64 = filteredImageURLs
        .filter((imgURL) => !removedImages.includes(imgURL))
        .map(async (imgURL) => {
          const parts = imgURL.split("/");
          const fileName = parts[parts.length - 1]; // Get the last part of the URL
  
          // Extract the timestamp from the file name
          const timestamp = fileName.split("_")[0].split("-").slice(-3).join(":");
  
          // Extract the corresponding Cage name from the file name
          const cageNameFromUrl = imgURL.split("/")[2];
          const cageName = cageNameMappings[cageNameFromUrl];
  
          // Fetch the image and convert it to base64
          const base64Image = await loadImageAsBase64(
            `https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`
          );
  
          // Create an object with the extracted data and base64 image
          const imageData = {
            date: selectedDate.toLocaleDateString(),
            time: timestamp,
            cage: cageName,
            ImageUrl: `https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`,
            base64Img: base64Image,
          };
  
          return imageData;
        });
  
      // Wait for all promises to resolve
      const transformedData = await Promise.all(dataWithBase64);
      // setBaseImgArr(transformedData.map((row) => row.base64Img));
      baseImgArr = transformedData.map((row) => row.base64Img);
      bodyData = transformedData.map((data) => [data.date, data.time, data.cage]);
      if(transformedData.length!==0){
        setIsDataFilled(true);
      }      
      // Now, transformedData contains the data with base64 images
      console.log(transformedData);
    } catch (error) {
      console.error("Error fetching and processing data:", error);
      // You can handle the error here, e.g., show an error message to the user.
    }
  };

  const loadImageAsBase64 = async (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const base64Image = canvas.toDataURL("image/jpeg");
        resolve(base64Image);
      };

      img.onerror = (error) => {
        reject(error);
      };
    });
  };

  // ...

  // Call fetchData to fetch and convert the images

    fetchData();

  

  // Call the modified loadImageAsBase64 with compression parameters
  // const dataWithBase64 = filteredImageURLs
  //   .filter((imgURL) => !removedImages.includes(imgURL))
  //   .map(async (imgURL) => {
  //     const parts = imgURL.split("/");
  //     const fileName = parts[parts.length - 1];

  //     // Extract the timestamp from the file name
  //     const segments = fileName.split("_")[0].split("-");
  //     const timestamp = segments.slice(-3).join(":");

  //     const cageNameFromUrl = parts[2]; // Assuming that the part of the URL containing the cage name is at index 2

  //     // Look up the cage name in the cageNameMappings object
  //     const cageName = cageNameMappings[cageNameFromUrl];

  //     // Fetch the image and convert it to base64 with compression
  //     const compressedBase64Image = await loadImageAsBase64(
  //       `https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`,
  //       maxWidth, // Specify maximum width if needed
  //       maxHeight, // Specify maximum height if needed
  //       quality   // Specify image quality (optional, default is 0.8)
  //     );

  //     const imageData = {
  //       date: selectedDate.toLocaleDateString(),
  //       time: timestamp,
  //       cage: cageName,
  //       ImageUrl: `https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`,
  //       base64Img: compressedBase64Image, // Use the compressed base64 image
  //     };

  //     return imageData;
  //   });

  // Call fetchData to fetch and convert the images
  fetchData();
  // Now, transformedData contains the data in the desired JSON structure
  const generate = () => {
    var doc = new jsPDF();

    console.log(baseImgArr);
    doc.autoTable({
      html: "#table-to-pdf",
      bodyStyles: { minCellHeight: 15 },
      
      didDrawCell: function (data) {
        if (data.column.index === 5 && data.cell.section === "body") {
          var td = data.cell.raw;
          var img = td.getElementsByTagName("img")[0];
          const url = new URL(img.src);
          const baseURL = `${url.protocol}//${url.host}`;
          console.log(baseURL);
          var textPos = data.cell.textPos;

          // Calculate the dimensions for the rectangular image
          var dimWidth = data.cell.width - data.cell.padding("horizontal");
          var dimHeight = data.cell.height - data.cell.padding("vertical");
          const imageWidth = 100; // Adjust the width as needed
          const imageHeight = (imageWidth / 4) * 1;
          
          // Find the corresponding base64 image from transformedData
          baseImgArr.forEach((base64Image) => {
            // Calculate dimensions for the image
            // Maintain the aspect ratio

            doc.addImage(base64Image, "JPG", 20, 10, imageWidth, imageHeight);
          });

          // Log the populated baseImgArr
          console.log(baseImgArr);
        }
      },
    });

    doc.save("table.pdf");
  };

  const printPdf = async () => {
    const doc = new jsPDF();
    const promises = [];
    const imageWidth = 25; // Adjust the width as needed
    const imageHeight = (imageWidth / 6) * 1;

    // Map the baseImgArr to associate each image with its index
    // Get the current date and time

    const currentDate = new Date();

    // Format current date in YYYY_MM_DD for the "generated_at" part
    const generatedAtDate = currentDate
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "_"); // Format: YYYY_MM_DD

    // Format current time in HH_MM_SS_AM/PM
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const amOrPm = hours >= 12 ? "PM" : "AM";
    const currentTimeString = `${
      hours % 12 || 12
    }_${minutes}_${seconds}_${amOrPm}`;

    // Generate the dynamic file name
    const fileName = `Sterlite_Report_${generatedAtDate}_generated_at_${currentTimeString}.pdf`;

    // Initialize the Y coordinate
    const title = "Sterlite Report";
    const fontSize = 16; // Set the font size for the title
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width

    // Calculate the width of the title text
    const titleWidth =
      (doc.getStringUnitWidth(title) * fontSize) / doc.internal.scaleFactor;

    // Calculate the x-position to center the title
    const x = (pageWidth - titleWidth) / 2;
    const y = 20; // Adjust the vertical position as needed
    let drawCell = (data) => {
      if (data.column.index === 3 && data.cell.section === "body") {
        // Adjust the cell padding and background

        const cellPadding = 2;
        var td = data.cell.raw;
        var dim = data.cell.height - data.cell.padding("vertical");
        var x = data.cell.x + cellPadding;
        var y = data.cell.y + cellPadding;
        doc.setFillColor(255, 255, 255);

        // Calculate the Y coordinate for the images
        const imageY = y;
        doc.addImage(
          quant_viz_logo,
          "JPG",
          20,
          5,
          20,
          17
        );
        // Add the images associated with the current row index
        const rowIndex = data.row.index;
        doc.addImage(
          baseImgArr[rowIndex],
          "JPG",
          x,
          y,
          imageWidth,
          imageHeight
        );
      }
    };

    // After adding images, calculate the total height used for images
    // const totalImageHeight = 6 * baseImgArr.length;

    // Define the header separately
    const header = ["Date", "Time", "Cage", "Image"];

    // Define the body transformedData
    console.log(bodyData);
    doc.setFontSize(fontSize);
    const drawTitle = () => {
      doc.setFontSize(fontSize);
      doc.text(title, x, y);
    };
    const tableY = 30;

    doc.autoTable({
      head: [header], // Include only the header as an array
      body: bodyData, // Provide the body data as a separate array
      startY: tableY, // Set the starting Y coordinate for the table
      didDrawCell: drawCell,
      didDrawPage: function(data) {
        if (data.pageCount === 1) {
          drawTitle();
        }
      },
    });

    doc.save(fileName);
  };
  return (
    <div className="table-container">
      <button id="pdf-generate-btn" onClick={printPdf} disabled={!isDataFilled}>
        Convert to PDF
      </button>
      {/* <div ref={componentPDF} style={{width:"50%"}} > */}
      {filteredImageURLs.length === 0 ? ( // Check if there are no images
        <LoadingAnimation /> // Render the loading animation component
      ) : (
        <div id="content-to-pdf">
          <table className="table" id="table-to-pdf" ref={pdfRef}>
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME</th>
                <th>CAGE</th>
                <th>VERIFY</th>
                <th>IMAGE</th>
              </tr>
            </thead>
            <tbody>
              {filteredImageURLs
                .filter((imgURL) => !removedImages.includes(imgURL))
                .map((imgURL, index) => {
                  const parts = imgURL.split("/");
                  const fileName = parts[parts.length - 1]; // Get the last part of the URL

                  // Extract the timestamp from the file name
                  const timestamp = fileName
                    .split("_")[0]
                    .split("-")
                    .slice(-3)
                    .join(":");

                  // Extract the corresponding Cage name from the file name

                  const cageNameFromUrl = imgURL.split("/")[2];
                  const cageName = cageNameMappings[cageNameFromUrl];

                  const identifier = imgURL;
                  // console.log(identifier);

                  const handleRemoveRow = (identifierToRemove) => {
                    setFilteredImageURLs((prevImages) =>
                      prevImages.filter((url) => url !== identifierToRemove)
                    );

                    setRemovedImages((prevRemovedImages) => [
                      ...prevRemovedImages,
                      identifierToRemove,
                    ]);
                  };

                  return (
                    <tr key={index}>
                      <td datalabel="DATE">
                        {selectedDate.toLocaleDateString()}
                      </td>
                      <td datalabel="TIME">{timestamp}</td>
                      <td datalabel="CAGE">{cageName}</td>
                      <td datalabel="VERIFY">
                        <div className="verify-buttons">
                          <YES identifier={identifier} />
                          <NO
                            identifier={identifier}
                            onRemove={handleRemoveRow}
                          />
                        </div>
                      </td>
                      <td datalabel="IMAGE">
                        <img
                          src={`https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`}
                          alt="No_Image_Available"
                        />
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// onCopyImage={handleCopyImage}

// useEffect(() =>{
//     const currentDate = new Date();
//     const todayYear = currentDate.getFullYear();
//     const todayMonth = currentDate.getMonth() + 1;
//     const todayDay = currentDate.getDate();

//     const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

//     setFormattedDate(todayDate);
// }, []);

// useEffect(() =>{
//     fetchImgURLs(formattedDate);
// }, [formattedDate]);

// useEffect(() =>{
//     const initialCage = "Cage 24";
//     setSelectedCage(initialCage);
// }, [setSelectedCage])

// useEffect(() =>{
//     fetchImgURLs(selectedCage);
// }, [selectedCage]);

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: "userData",
//     onAfterPrint: () => alert("Data saved in pdf")
//   })

// const getTableData = () => {
//     const tableData = filteredImageURLs
//       .filter((imgURL) => !removedImages.includes(imgURL))
//       .map((imgURL) => {
//         // Extract data from imgURL and format it into an array representing a row
//         const parts = imgURL.split("/");
//         const fileName = parts[parts.length - 1];
//         const timestamp = fileName.split("_")[0].split("-").slice(-3).join(":");
//         const cageNameFromUrl = imgURL.split("/")[2];
//         const cageName = cageNameMappings[cageNameFromUrl];

//         // Customize this array to include the data you want in each row
//         return [selectedDate.toLocaleDateString(), timestamp, cageName, 'YES/NO'];
//       });

//     // Add headers to your table data
//     const tableHeaders = ['DATE', 'TIME', 'CAGE', 'VERIFY'];

//     return [tableHeaders, ...tableData];
//   };

// const generatePDF = () =>{
//     const doc = new jsPDF();
//     doc.text("Defect Details", 20,10);

//     doc.save('table.pdf');
// }

//         {/* <tr key={index}>
//     <td datalabel="DATE">{selectedDate.toLocaleDateString()}</td>
//     <td datalabel="TIME">{timestamp}</td>
//     <td datalabel="CAGE">
//     {selectedCage === "All" ? cageName : selectedCage !== ""? selectedCage : "No Cage Seledted"}
//     </td>
//     <td datalabel="VERIFY">
//     <div className='verify-buttons'>
//     <YES identifier={imgURL} />
//     <NO identifier={identifier} onRemove={handleRemoveRow} />
//     </div>
//     </td>
//     <td datalabel="IMAGE">
//     <img src={`https://cvsterlite.s3.ap-south-1.amazonaws.com/${imgURL}`} alt="No_Image_Available" />
//     </td>
// </tr> */}

// const handleCopyImage = async(defect, identifier) =>{
//     try{

//         const response = await fetch(`http://localhost:7000/copyImage`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                  defect,
//                  identifier,
//                 }),
//         });
//         try{
//             if(response.ok){
//                 console.log("image copied successfully");
//             } else{
//                 console.error('Error copying image',response);
//             }
//         } catch(err){
//             console.error("Error",err);
//         }

//     }catch(error){
//         console.error('Error Copying Image', error);
//     }
// };

// const transformedData = [];
// let baseImgArr=[];
// let bodyData=[];
// // Loop through the filtered image URLs
// const fetchData = async () => {
//  const promises = [];

//  const dataWithBase64 = filteredImageURLs
//    .filter((imgURL) => !removedImages.includes(imgURL))
//    .map(async (imgURL) => {
//      const parts = imgURL.split("/");
//      const fileName = parts[parts.length - 1]; // Get the last part of the URL

//      // Extract the timestamp from the file name
//      const timestamp = fileName.split("_")[0].split("-").slice(-3).join(":");

//      // Extract the corresponding Cage name from the file name
//      const cageNameFromUrl = imgURL.split("/")[2];
//      const cageName = cageNameMappings[cageNameFromUrl];

//      // Fetch the image and convert it to base64
//      const base64Image = await loadImageAsBase64(
//        `https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`
//      );

//      // Create an object with the extracted data and base64 image
//      const imageData = {
//        date: selectedDate.toLocaleDateString(),
//        time: timestamp,
//        cage: cageName,
//        ImageUrl: `https://sterlite-dashboard.s3.ap-south-1.amazonaws.com/${imgURL}`,
//        base64Img: base64Image,
//      };

//      return imageData;
//    });

//  // Wait for all promises to resolve
//  const transformedData = await Promise.all(dataWithBase64);
//  // setBaseImgArr(transformedData.map((row) => row.base64Img));
//  baseImgArr=(transformedData.map((row) => row.base64Img));
//  bodyData = transformedData.map((data) => [data.date, data.time, data.cage]);

//  // Now, transformedData contains the data with base64 images
//  console.log(transformedData);
// };

// const loadImageAsBase64 = async (url) => {
//  return new Promise((resolve, reject) => {
//    const img = new Image();
//    img.crossOrigin = "Anonymous";
//    img.src = url;

//    img.onload = () => {
//      const canvas = document.createElement("canvas");
//      canvas.width = img.width;
//      canvas.height = img.height;
//      const ctx = canvas.getContext("2d");
//      ctx.drawImage(img, 0, 0);

//      const base64Image = canvas.toDataURL("image/jpeg");
//      resolve(base64Image);
//    };

//    img.onerror = (error) => {
//      reject(error);
//    };
//  });
// };

// // Call fetchData to fetch and convert the images
// fetchData();
