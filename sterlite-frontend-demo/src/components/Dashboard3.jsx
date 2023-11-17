import React, { useState, useEffect, useRef, forwardRef } from "react";
import "./componentscss/Dashboard.css";
import "./componentscss/DashboardRight.css";
import Logo from "../Images/Quant-AI.png";
import { FaHome } from "react-icons/fa";
import { RxBell } from "react-icons/rx";
import { ReactComponent as Graph } from "../Logos/AnalyticsLogo.svg";
import { ReactComponent as Report } from "../Logos/ReportLogo.svg";
import { ReactComponent as Support } from "../Logos/SupportLogo.svg";
import { ReactComponent as Settings } from "../Logos/SettingsLogo.svg";
import { ReactComponent as Logout } from "../Logos/LogoutLogo.svg";
import { ReactComponent as MeatBall } from "../Logos/MeatBall.svg";
import Topbar from "./Topbar";
import Table from "./Table3";
import "./componentscss/Topbar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ShiftDropdown from "./ShiftDropdown";
import CageDropdown from "./CageDropdown";
import "./componentscss/CalendarIcon.css";
// import generatePDF from './generatePDF';
import DownloadForm from "./DownloadForm";
import { printPdf } from "./GenerateTablePdf";

// import { TableDataProvider } from "./TableDataContext";
// import GeneratePDFContext from "./GeneratePDFContext";
// import { saveAs } from 'file-saver';
// import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
// import { PDFDocument, rgb } from 'pdf-lib';
// import GeneratePDFProvider from "./GeneratePDFContext";
// import { useReactToPrint } from 'react-to-print';

function Dashboard() {
  const [activeButton, setActiveButton] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [formattedDate, setFormattedDate] = useState("");
  const [selectedCage, setSelectedCage] = useState("All");
  const [selectedShift, setSelectedShift] = useState();
  const [downloadFormOpen, setDownloadFormOpen] = useState(false);
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [parentBodyData, setParentBodyData] = useState([]);
  const [parentBaseImgArr, setParentBaseImgArr] = useState([]);
  const [isParentDataFilled, setIsParentDataFilled] = useState(false);

  const handleDataUpdate = (baseImgArr, bodyData, isDataFilled) => {
    setParentBaseImgArr(baseImgArr);
    setParentBodyData(bodyData);
    setIsParentDataFilled(isDataFilled);
    //   console.log(parentBaseImgArr,parentBodyData)
  };

  const handleButtonClick = (buttonIndex) => {
    setActiveButton(buttonIndex);
  };

  const findClosestAvailableDate = async (date) => {
    const baseUrl = `${process.env.REACT_APP_FETCH_LINK}images`; // Replace with your API URL
    const selectedDate = new Date(date);

    const jetsonNames = ["jetson1", "jetson2", "jetson3"];
    let closestDate = null;

    while (selectedDate >= new Date("2023-07-02")) {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
      const day = selectedDate.getDate().toString().padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      let dateHasImages = false;

      for (const jetsonName of jetsonNames) {
        const imageUrl = `${baseUrl}/${jetsonName}/${formattedDate}/`;
        const response = await fetch(imageUrl);

        if (response.ok) {
          const data = await response.json();

          if (data.images && data.images.length > 0) {
            dateHasImages = true;
            break; // Images are available for this date
          }
        }
      }

      if (dateHasImages) {
        closestDate = formattedDate; // Found a date with images
        break;
      }

      // Move to the previous day
      selectedDate.setDate(selectedDate.getDate() - 1);
    }

    return closestDate;
  };

  useEffect(() => {
    const fetchClosestDate = async () => {
      const today = new Date();
      const closestAvailableDate = await findClosestAvailableDate(today);

      if (closestAvailableDate) {
        setSelectedDate(new Date(closestAvailableDate));
        setFormattedDate(closestAvailableDate);
      }
    };

    fetchClosestDate();
  }, []);

  const handleDateChange = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const newformattedDate = `${year}-${month}-${day}`;
      setFormattedDate(newformattedDate);
      setSelectedDate(date);
      console.log(date);
      console.log(newformattedDate);
      console.log(typeof newformattedDate); // string
      console.log("date cjhanged")
    } else {
      setSelectedDate(null);
      console.log("date not cjhanged")
    }
  };

  const handleDownloadPopup = () => {
    setDownloadFormOpen(true);
  };

  const ExampleCustomInput = forwardRef(({ value, onClick, onChange }, ref) => (
    <input
      value={value}
      className="example-custom-input"
      onClick={onClick}
      onChange={onChange}
      ref={ref}
    ></input>
  ));

  return (
    <div className="dashboard-container">
      <div className="dashboard-left">
        <div className="dashboard-left-top">
          <div className="dashboard-title">
            <div className="dashboard-title-left">
              <img src={Logo} alt="LOGO" className="quant-logo" />
              <span className="logo-text">Quant VIZ</span>
            </div>
          </div>

          <div className="dashboard-left-main">
            <button
              disabled
              className={`dashboard-icon-container-btn ${
                activeButton === 0 ? "active" : ""
              }`}
              onClick={() => handleButtonClick(0)}
            >
              <FaHome className="icon" />
              <span>Home</span>
            </button>

            <button
              disabled
              className={`dashboard-icon-container-btn ${
                activeButton === 1 ? "active" : ""
              }`}
              onClick={() => handleButtonClick(1)}
            >
              <Graph className="icon" />
              <span>Analytics</span>
            </button>

            <button
              disabled
              className={`dashboard-icon-container-btn ${
                activeButton === 2 ? "active" : ""
              }`}
              onClick={() => handleButtonClick(2)}
            >
              <Report className="icon" />
              <span>Report</span>
            </button>

            <button
              disabled
              className={`dashboard-icon-container-btn ${
                activeButton === 3 ? "active" : ""
              }`}
              onClick={() => handleButtonClick(3)}
            >
              <Support className="icon" />
              <span>Support</span>
            </button>

            <button
              disabled
              className={`dashboard-icon-container-btn ${
                activeButton === 4 ? "active" : ""
              }`}
              onClick={() => handleButtonClick(4)}
            >
              <Settings className="icon" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <button
          disabled
          className={`dashboard-left-footer-btn ${
            activeButton === 6 ? "active" : ""
          }`}
          onClick={() => handleButtonClick(6)}
        >
          <Logout className="ic" />
          <span>Logout</span>
        </button>
      </div>

      <div className="dashboard-right">
        <div className="dashboard-right-top">
          <div className="dashboard-title-right">
            <span className="dashboard-title-right-span">
              DAILY DEFECT DATA
            </span>
          </div>
          <div className="dashboard-title-end">
            <button className="dashboard-right-icon-btn">
              <RxBell className="icon-right" />
            </button>
            <button className="dashboard-right-icon-btn">
              <MeatBall className="icon-right" />
            </button>
          </div>
        </div>

        <div className="dashboard-right-main">
          <div className="topbar-container">
            <div className="topbar-left">
              <button className="topbar-left-button disable">RST 1</button>
              <button className="topbar-left-button disable">RST 2</button>
              <button className="topbar-left-button disable">RST 3</button>
              <button className="topbar-left-button disable">RST 4</button>
              <button className="topbar-left-button hoverable">RST 5</button>
              <button className="topbar-left-button disable">RST 6</button>
            </div>
            <div className="topbar-right">
              <CageDropdown
                className="topbar-right-button"
                selectedCage={selectedCage}
                setSelectedCage={setSelectedCage}
              />
              <ShiftDropdown
                className="topbar-right-button"
                selectedShift={selectedShift}
                setSelectedShift={setSelectedShift}
              />

              {/* <button className='topbar-right-button'>Selected Date</button> */}
              <DatePicker
                className="topbar-right-button"
                selected={selectedDate}
                onChange={handleDateChange}
                customInput={<ExampleCustomInput />}
                //  placeholderText='Please Select a Date...'
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                showYearDropdown
                scrollableMonthYearDropdown
              />
              <button
                className="topbar-right-button download-button"
                onClick={() => printPdf(parentBaseImgArr, parentBodyData)}
                disabled={!isParentDataFilled}
              >
                Download
              </button>
              {downloadFormOpen && (
                <DownloadForm
                  onClose={() => setDownloadFormOpen(false)}
                  fromDate={fromDate}
                  setFromDate={setFromDate}
                  toDate={toDate}
                  setToDate={setToDate}
                  //  generatePDF={generatePDF}
                />
              )}
            </div>
          </div>
          {/* </TableDataProvider>      */}

          <Table
            selectedDate={selectedDate}
            selectedCage={selectedCage}
            setSelectedCage={setSelectedCage}
            formattedDate={formattedDate}
            setFormattedDate={setFormattedDate}
            selectedShift={selectedShift}
            fromDate={fromDate}
            toDate={toDate}
            bodyData={parentBodyData}
            setBodyData={setParentBodyData}
            baseImgArr={parentBaseImgArr}
            setBaseImgArr={setParentBaseImgArr}
            isDataFilled={isParentDataFilled}
            setIsDataFilled={setIsParentDataFilled}
            onDataUpdate={handleDataUpdate}
            //  generatePDF={generatePDF}
          />
          {/* </div> */}
        </div>
      </div>
    </div> // container div
  );
}
export default Dashboard;
