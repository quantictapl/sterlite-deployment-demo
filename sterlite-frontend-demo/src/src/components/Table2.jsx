import React, { useEffect, useState, useCallback, useRef } from "react";
import "./componentscss/Table.css";
import YES from "./YES";
import NO from "./NO";
import "./componentscss/Toggle.css";
import LoadingAnimation from "./LoadingAnimation";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { quant_viz_logo } from "../Images/QuantVizLogo";
import { printPdf } from "./GenerateTablePdf";

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
  baseImgArr,  // Use the prop directly
  bodyData,
  setBodyData,
  setBaseImgArr,
  isDataFilled,
  setIsDataFilled, 
  onDataUpdate
}) {
  // state and setState function to store and update state respectively. imgURLs store the array of image urls.
  const [imgURLs, setImgURLs] = useState([]);
  const [filteredImageURLs, setFilteredImageURLs] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
//   const [isDataFilled, setIsDataFilled] = useState(false);
  const [transformedData,setTransformedData]=useState([]);
//   const [baseImgArr,setBaseImgArr]=useState([]);
//   const [bodyData,setBodyData]=useState([]);
  
  // const [baseImgArr,setBaseImgArr]=useState([]);
  const pdfRef = useRef(null);
  // const [selectedDefects, setSelectedDefects] = useState({});

  useEffect(() => {
    onDataUpdate(baseImgArr, bodyData,isDataFilled);
  }, [baseImgArr, bodyData, onDataUpdate,isDataFilled]);
  useEffect(() => {
    const currentDate = new Date();
    const todayYear = currentDate.getFullYear();
    const todayMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // padding required to match format with backend
    const todayDay = currentDate.getDate().toString().padStart(2, "0"); // padding required to match format with backend

    const todayDate = `${todayYear}-${todayMonth}-${todayDay}`;

    setFormattedDate(todayDate);
  }, [setFormattedDate]);


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


  // Define image compression parameters
  const maxWidth = 640; // Adjust this value as needed
  const maxHeight = 70; // Adjust this value as needed
  const quality = 0.5; // Adjust the quality as needed (0.0 to 1.0)

  // // Loop through the filtered image URLs
  const fetchData = useCallback(async () => {
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
      const transformedDataArr = await Promise.all(dataWithBase64);
      setTransformedData(transformedDataArr);
      // setBaseImgArr(transformedData.map((row) => row.base64Img));
    //   let baseImgArray = transformedData.map((row) => row.base64Img);
    //   setBaseImgArr(baseImgArray);
    //   let bodyDataArray = transformedData.map((data) => [data.date, data.time, data.cage]);
    //   setBodyData(bodyDataArray)
      // Now, transformedData contains the data with base64 images
    } catch (error) {
      console.error("Error fetching and processing data:", error);
      // You can handle the error here, e.g., show an error message to the user.
    }
  });
  useEffect(()=>{
    setBaseImgArr(transformedData.map((row) => row.base64Img));
    setBodyData(transformedData.map((data) => [data.date, data.time, data.cage]))
  },[transformedData])

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
  useEffect(()=>{
    fetchData();
  },[fetchData,filteredImageURLs])
    
      useEffect(()=>{
        if (transformedData.length===filteredImageURLs.length && bodyData.length>0) {
            const transformedDataDate = transformedData[0].date;
            const parts = transformedDataDate.split('/');
            const transformedDate = new Date(parts[2], parts[1] - 1, parts[0]);
             // year, month (0-based), day
          
            // Create a new Date object for the selected date without considering the time
            const selectedDateObj = new Date(selectedDate);
            const selectedDateWithoutTime = new Date(
              selectedDateObj.getFullYear(),
              selectedDateObj.getMonth(),
              selectedDateObj.getDate()
            );
            //  console.log(transformedDate)
            //  console.log(selectedDateWithoutTime)
            setIsDataFilled(
              transformedDate.getTime() === selectedDateWithoutTime.getTime()
            );
            
          } else {
            setIsDataFilled(false);
          }
      },[bodyData.length, filteredImageURLs.length, selectedDate, transformedData])
      useEffect(()=>{
          setBodyData([])
      },[selectedDate])

  return (
    <div className="table-container">
      <button id="pdf-generate-btn" className="pdf-generate-button" onClick={()=>printPdf(baseImgArr,bodyData)} disabled={!isDataFilled}>
        Download
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

