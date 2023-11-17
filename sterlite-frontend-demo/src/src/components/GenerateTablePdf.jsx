import { jsPDF } from "jspdf";
import { quanticLogo, quantPdfFooter } from "../Images/QuantVizLogo";

export const printPdf = async (baseImgArr, bodyData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const imageWidth = pageWidth * 0.98; // Adjust the width as needed
  const imageHeight = 35; // Adjust the height as needed
  const tableImageWidth = 25;
  const tableImageHeight = (tableImageWidth / 6) * 1; // Adjust the height for the images in the table

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
  const fontSize = 16; // Set the font size for the title
  const x = 10; // Adjust the horizontal position
  let y = 10; // Adjust the vertical position

  // Add the images associated with the current row index
  doc.addImage(quanticLogo, "JPG", 3, y, imageWidth, imageHeight);

  // Draw line below the image taking 90% of the horizontal space
  const imageLineHeight = 0.5; // Adjust the thickness of the line
  const imageLineWidth = pageWidth * 0.9; // Take 90% of the horizontal space
  // doc.line(x, y + imageHeight, x + imageLineWidth, y + imageHeight);

  // Draw title centered below the line
  const title = "Sterlite Report";
  doc.setFontSize(fontSize);
  const titleWidth = (doc.getStringUnitWidth(title) * fontSize) / doc.internal.scaleFactor;
  const titleX = (pageWidth - titleWidth) / 2; // Center-align the title
  const titleY = y + imageHeight + 10; // Adjust the distance between the image and title
  doc.text(title, titleX, titleY);

  // Draw line below the title
  const titleLineY = titleY + 4; // Adjust the distance below the title
  const titleLineWidth = titleWidth; // Line width equals the title width
  doc.line(titleX, titleLineY, titleX + titleLineWidth, titleLineY);

  // Add present day's date centered below the title
  const smallerFontSize = 12; // Set the smaller font size
  const dateOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };

  const formattedDate = currentDate.toLocaleDateString("en-US", dateOptions);
  const presentDate = `[${formattedDate}]`;
  const dateWidth = (doc.getStringUnitWidth(presentDate) * smallerFontSize) / doc.internal.scaleFactor;
  const dateX = (pageWidth - dateWidth) / 2; // Center-align the date below the title
  const dateY = titleLineY + 8; // Adjust the distance below the title line

  doc.setFontSize(smallerFontSize);
  doc.text(presentDate, dateX, dateY);

  // Push the table below
  y = dateY + 8; // Update the Y coordinate

  // Define the header separately
  const header = ["Date", "Time", "Cage", "Image"];
  let drawCell = (data) => {
    if (data.column.index === 3 && data.cell.section === "body") {
      const cellPadding = 2;
      var td = data.cell.raw;
      var dim = data.cell.height - data.cell.padding("vertical");
      var x = data.cell.x + cellPadding;
      var y = data.cell.y + cellPadding;
      doc.setFillColor(255, 255, 255);

      const rowIndex = data.row.index;
      doc.addImage(
        baseImgArr[rowIndex],
        "JPG",
        x,
        y,
        tableImageWidth,
        tableImageHeight
      );
    }
  };

  // Draw the table on the current page
  doc.autoTable({
    head: [header],
    body: bodyData,
    startY: y, // Start the table below the date
    didDrawCell: drawCell,
  });

  // Add the footer image on the last page
  const totalPages = doc.internal.getNumberOfPages();
  doc.setPage(totalPages); // Set the active page to the last page
  doc.addImage(quantPdfFooter, "JPG", 0, pageHeight - 35, pageWidth, imageHeight);

  doc.save(fileName);
};