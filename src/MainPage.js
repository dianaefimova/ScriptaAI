import React, { useState, useRef, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { getChatCompletion } from "./openaiService";
import { CiMenuBurger } from "react-icons/ci";
import { FaInfoCircle } from "react-icons/fa";
import './styles/MainPage.css';
import Background from "./Background";
import { motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';


const tutorialSteps = [
  { id: 1, text: "Choose a role for AI assistant", target: "roleButtons" },
  { id: 2, text: "Paste your code, no need for any other information", target: "inputField" },
  { id: 3, text: "Click for AI answer", target: "aiResponseButton" },
  { id: 4, text: "Click to get your code complexity", target: "checkDifficultyButton" },
];

const MainPage = () => {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedAI, setSelectedAI] = useState("teacher"); 
    const [prediction, setPrediction] = useState(""); 
    const [loading2, setLoading2] = useState(false); 
    const [showButtons, setShowButtons] = useState(false);
    const [step, setStep] = useState(0);
    const [tooltipStyle, setTooltipStyle] = useState({});
    const [tooltipText, setTooltipText] = useState("");
    const [showInfo, setShowInfo] = useState(false);
  

    // References for tutorial step highlights
    const roleButtonsRef = useRef(null);
    const inputFieldRef = useRef(null);
    const aiResponseButtonRef = useRef(null);
    const checkDifficultyButtonRef = useRef(null);

    const refs = {
      roleButtons: roleButtonsRef,
      inputField: inputFieldRef,
      aiResponseButton: aiResponseButtonRef,
      checkDifficultyButton: checkDifficultyButtonRef,
    };

    useEffect(() => {
      const tutorialComplete = localStorage.getItem("Tutorial") //check in local storage if tutorial has been completed
      
      if(tutorialComplete === "true") {
        setStep(tutorialSteps.length);
      } else {
        setStep(0);  // Ensure tutorial starts when the page loads
      }
  }, []);

    useEffect(() => {

      Object.values(refs).forEach(ref => ref.current?.classList.remove("highlight"));

      const currentStep = tutorialSteps[step];
      if (currentStep && refs[currentStep.target]?.current) {
        const element = refs[currentStep.target].current;
        element.classList.add("highlight");

        setTooltipText(currentStep.text);

        // Position the tooltip near the highlighted element
        const rect = element.getBoundingClientRect();
        setTooltipStyle({
        top: rect.top + window.scrollY - 60,
          left: rect.left + window.scrollX + rect.width / 2,
          transform: "translateX(-50%)",


        });

        // Move to next step automatically after 3 seconds
        const timeout = setTimeout(() => {
          if (step < tutorialSteps.length - 1) {
            setStep(prevStep => prevStep + 1);
          } else {
            localStorage.setItem("Tutorial", "true");
            setTooltipStyle({display: "none"});
            Object.values(refs).forEach(ref => ref.current?.classList.remove("highlight"));
          }
          
        }, 3000);

        return () => clearTimeout(timeout);
      } else {
        setTooltipStyle({display: "none"});
        Object.values(refs).forEach(ref => ref.current?.classList.remove("highlight"));
      }
    }, [step]);

    const skipButton = () => {
      localStorage.setItem("Tutorial", "true");
      setStep(tutorialSteps.length);
      setTooltipStyle({display: "none"});
      Object.values(refs).forEach(ref => ref.current?.classList.remove("highlight"));
    };

    // Making tutorial start only when new page is opened 

    const handleShowButtons = () => {
   setShowButtons(!showButtons)
    };

    const InfoButton = () => {
      setShowInfo(!showInfo)
       };
    
  const handleInputChange = (e) => {
    setUserInput(e.target.value); 
  };

  // Function to send code to backend for difficulty prediction
  const handleCheckDifficulty = async () => {
    if (!userInput.trim()) {
      alert("Please enter some code before checking difficulty.");
      return;
    }

    setLoading2(true); 

    try {
      const response = await axios.post("https://ann-training.onrender.com/predict/", {
        code: userInput, 
      });

      setPrediction(response.data.difficulty); 
    } catch (error) {
      console.error("Error predicting difficulty:", error);
      setPrediction("Error in prediction. Insert Python code.");
    }

    setLoading2(false); 
  };

  
    // Predefined AI roles
    const aiRoles = {
      teacher: "Act as a programming teacher. When a user provides code, explain every detail of the code thoroughly. Do not generate or modify any code — only explain the code that the user inputs. If the user's request includes a question but no code, politely ask them to provide the code they want explained. Keep explanation very short and very clear.",
      debugger: "Act as a debugger. When a user provides code, debug the code thoroughly. Do not generate or modify any code — only debug the code that the user inputs. If the user's request includes a question but no code, politely ask them to provide the code they want explained. Keep explanation very short and very clear.",
      optimizer: "Act as a senior developer. When a user provides code, propose ways to optimize the code. Do not generate or modify any code — only propose ways to optimize the users code. If the code is already optimized, say so and do not propose anything extra. If the user's request includes a question but no code, politely ask them to provide the code they want explained. Keep explanation very short and very clear.",
      commenter: "Act as a programming assistance. When a user provides code, return the same code with clear comments. Do not generate or modify any code — only provide comments inside the code, so the code wiuld compile with comments. If the user's request includes a question but no code, politely ask them to provide the code they want explained. Keep explanation very short and very clear.",
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!userInput.trim()) {
        alert("Please enter some code.");
        return;
      }

      setLoading(true);
      setResponse(""); 
   
  
      try {
        const messages = [
          { role: "system", content: aiRoles[selectedAI] },
          { role: "user", content: userInput },
        ];
        const apiResponse = await getChatCompletion(messages);
        setResponse(apiResponse);
      } catch (error) {
        setResponse("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div>
        <Background/>
        {step < tutorialSteps.length && (
        <div className="tooltip-box" style={tooltipStyle}>
          <motion.p key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            {tooltipText}
          </motion.p>
          <button onClick={skipButton} className="skipButton btn btn-danger">
           Skip Tutorial
          </button>
        </div>       
)}

        <div className="Info">
      <button className="info-icon" onClick={InfoButton}>
        <FaInfoCircle/>
       </button>

       {showInfo && (
        <div className="Info-field">
          <textarea defaultValue="Welcome to educational platform for programmers! 
          Step 1: Choose role on top of the page. 
          Step 2 : Insert your code (no additional info required).
          Step 3 : Press 'Get AI Response'
          Step 4 : Press 'Check Difficulty' to get code complexion
          No input data is being saved or used for commersial purposes" />
        </div>  
       )}
      </div>
        <div className="menu-icon" onClick={handleShowButtons}>
        <CiMenuBurger/>
       </div>

 
     

      
        <div className="row">


       <div ref={roleButtonsRef} className={`buttons ${showButtons && 'active'}`}>
                {Object.keys(aiRoles).map((role) => (
                    <button
                        key={role}
                        className={`AIbutton row ${selectedAI === role ? "active" : ""}`}
                        type="button"
                        onClick={() => setSelectedAI(role)}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                ))}
       </div>


            <div className="text">
            <form onSubmit={handleSubmit}>
            <div ref={inputFieldRef} className="input-field">
                <textarea
                    className="input-text"
                    value={userInput}
                    onChange={handleInputChange}
                    placeholder="Paste your code or describe your problem..."
                    required
                />
                        <div className="predictionResult">
          {prediction && <h3><b>Code Difficulty:</b> {prediction}</h3>}
          </div>
               </div> 
             
                <button ref={aiResponseButtonRef} className="submit rounded" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Loading..." : "Get AI Response"}
                </button>
                <button ref={checkDifficultyButtonRef} className="submit rounded" onClick={handleCheckDifficulty} disabled={loading2}>
                    {loading2 ? "Checking..." : "Check Difficulty"}
                </button>
              
            </form>
            </div>

          <div className="answer" style={{borderColor: 'white'}}>
            {response && (
              <div className="AI-response"> 
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </div>
        

 

        </div>
 
      </div>
    );
  };
  
  export default MainPage;