import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PrintTable = () => {
  const data = [
    { name: "John", age: 25, gender: "male", imageUrl: "https://picsum.photos/200/300" },
    { name: "Mary", age: 28, gender: "female", imageUrl: "https://picsum.photos/200/300" },
    { name: "Bob", age: 22, gender: "male", imageUrl: "https://picsum.photos/200/300" },
  ];

  const printPdf = async () => {
    const doc = new jsPDF();
    const promises = [];
  
    // Define the fixed image size and positioning
    const imageWidth = 20;
    const imageHeight = 10;
    let currentY = 20;
  
    data.forEach((row) => {
      promises.push(loadImage(row.imageUrl).then((base64Image) => {
        // Add the image
        // doc.addImage(base64Image, "JPEG", 20, currentY, imageWidth, imageHeight);
  
        // Increment Y coordinate for the next image
        currentY += 2; // Adjust as needed
  
        // Add a row in the table for this data
        doc.autoTable({
          head: ["Name", "Age", "Gender","Image"],
          body: [[row.name, row.age, row.gender]],
        //   startY: currentY,
          didDrawCell: (data) => {
            if (data.column.index === 3 && data.cell.section === 'body') {
              // Adjust the cell padding and background
              
              const cellPadding = 2;
              var td = data.cell.raw;
              var dim = data.cell.height - data.cell.padding('vertical');
              var textPos = data.cell.textPos;
              doc.setFillColor(255, 255, 255);
            //   doc.rect(
            //     data.cell.x + cellPadding,
            //     data.cell.y + cellPadding,
            //     data.cell.width - 5 * cellPadding,
            //     data.cell.height - 2 * cellPadding, 
            //     "F" 
            //   );
              doc.addImage(base64Image, "JPEG",150,  currentY, dim, dim)
            }
          }
        });
  
        currentY += 10; // Adjust as needed
      }));
    });
  
    await Promise.all(promises);
  
    doc.save("table.pdf");
  };

  const loadImage = (url) => {
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

  return (
    <div>
      <button onClick={printPdf}>Print PDF</button>
      <h1>Table Data</h1>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.name}>
              <td>
                <img src={row.imageUrl} alt={row.name} width="20" height="20" />
              </td>
              <td>{row.name}</td>
              <td>{row.age}</td>
              <td>{row.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PrintTable;
// const printPdf = async () => {
//     const doc = new jsPDF();
//     const promises = [];
  
//     // Define the fixed image size and positioning
//     const imageWidth = 20;
//     const imageHeight = 10;
//     let currentY = 20;
  
//     data.forEach((row) => {
//       promises.push(loadImage(row.imageUrl).then((base64Image) => {
//         // Add the image
//         doc.addImage(base64Image, "JPEG", 20, currentY, imageWidth, imageHeight);
  
//         // Increment Y coordinate for the next image
//         currentY += 15; // Adjust as needed
  
//         // Add a row in the table for this data
//         doc.autoTable({
//           head: ["Name", "Age", "Gender"],
//           body: [[row.name, row.age, row.gender]],
//           startY: currentY,
//         });
  
//         currentY += 10; // Adjust as needed
//       }));
//     });
  
//     await Promise.all(promises);
  
//     doc.save("table.pdf");
//   };
// const printPdf = async () => {
//     const doc = new jsPDF();
//     const promises = [];
//     let currentY = 20; // Initialize the Y coordinate
  
//     data.forEach((row) => {
//       promises.push(loadImage(row.imageUrl).then((base64Image) => {
//         doc.addImage(base64Image, "JPEG", 20, currentY, 20, 10);
//         currentY += 5; // Increment Y coordinate for the next image
//       }));
//     });
  
//     await Promise.all(promises);
  
//     // After adding images, calculate the total height used for images
//     const totalImageHeight = 5 * data.length;
  
//     // Define the header separately
//     const header = ["Name", "Age", "Gender","Image"];
    
//     // Define the body data
//     const bodyData = data.map((row) => [row.name, row.age, row.gender]);
  
//     // Calculate the Y coordinate for the table
//     const tableY = 20 + totalImageHeight;
  
//     doc.autoTable({
//       head: [header], // Include only the header as an array
//       body: bodyData, // Provide the body data as a separate array
//       startY: tableY, // Set the starting Y coordinate for the table
      
//     });
  
//     doc.save("table.pdf");
//   };