import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const calculateAge = (dob) => {
        if (!dob || dob === "Not Selected") return "N/A";

        let birthDate = new Date(dob);

        if (isNaN(birthDate)) {
            const [day, month, year] = dob.split(/[-/]/);
            if (day && month && year) {
                birthDate = new Date(`${year}-${month}-${day}`);
            }
        }

        if (isNaN(birthDate)) return "Invalid DOB";

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const value = { calculateAge };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
 