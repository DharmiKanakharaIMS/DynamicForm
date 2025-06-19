import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { RadioButton } from "primereact/radiobutton";
import { Toast } from "primereact/toast";
// import { Password } from 'primereact/password';
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "./App.css";

const DynamicForm = () => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const toast = useRef(null);

  useEffect(() => {
    fetch("/db.json")
      .then((res) => res.json())
      .then((data) => {
        const fieldList = data.fields || [];
        setFields(fieldList);

        const initialState = fieldList.reduce((acc, field) => {
          acc[field.name] = "";
          return acc;
        }, {});
        setFormData(initialState);
      })
      .catch((err) => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Fetching Error "+err,
          life: 1500,
        });
      });
  }, []);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    fields.map(({ name, label, required, pattern, type }) => {
      let value = formData[name];

      if (type === "date" && value instanceof Date) {
        value = new Date(value).toLocaleDateString("en-GB"); 
      }
      value = (value || "").toString().trim();

      if (required && !value) {
        newErrors[name] = `${label} is required`;
      } else if (pattern && !new RegExp(pattern).test(value)) { 
        newErrors[name] = `Invalid ${label.toLowerCase()}`;
      }else if (pattern && !new RegExp(pattern).test(value)) {
  newErrors[name] =
    name === "password"
      ? `${label} must contain at least 6 characters, including uppercase, lowercase, and number`
      : `Invalid ${label.toLowerCase()}`;
}
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = (e) => {
  e.preventDefault();
  if (validate()) {
    const formattedData = { ...formData };

    fields.map(({ name, type }) => {
      if (type === "date" && formattedData[name] instanceof Date) {
        const d = formattedData[name];
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        formattedData[name] = `${day}/${month}/${year}`; 
      }
    });
    axios
      .post("http://localhost:3001/data", formattedData)
      .then(() => {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Form Submitted Successfully...!",
          life: 1500,
        });
        setErrors({});
        setFormData(fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {}));
      })
      .catch(() => {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: "Submission failed!",
          life: 1500,
        });
      });
  }
};

  return (
    <div style={{ padding: "1rem" }}>
      <form onSubmit={handleSubmit}>
        <h1>Dynamic Form</h1>
        {fields.map(({ name, type, label, options }) => {
          if (type === "dropdown") {
            return (
              <div key={name} style={{ marginBottom: "1rem" }}>
                <label htmlFor={name} style={{ display: "block", marginBottom: "0.2rem" }}>
                  {label}
                </label>
                <Dropdown
                  id={name}
                  value={formData[name]}
                  options={options}
                  style={{ width: "98%" }}
                  onChange={(e) => handleChange(name, e.value)}
                  placeholder={`Select ${label}`}
                  className={errors[name] ? "p-invalid" : ""}
                />
                {errors[name] && (
                  <small className="p-error" style={{ display: "block" }}>
                    * {errors[name]}
                  </small>
                )}
              </div>
            );
          } else if (type === "date") {
            return (
              <div key={name} style={{ marginBottom: "1rem" }}>
                <label htmlFor={name} style={{ display: "block", marginBottom: "0.2rem" }}>
                  {label}
                </label>
                <Calendar
                  id={name}
                  value={formData[name]}
                  showIcon
                  style={{ width: "98%" }}
                  onChange={(e) => handleChange(name, e.value)}
                  className={errors[name] ? "p-invalid" : ""}
                  dateFormat="dd/mm/yy"
                  placeholder={`Select ${label}`}
                  maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                  yearNavigator
                  touchUI
                  yearRange={`${new Date().getFullYear() - 100}:${new Date().getFullYear() - 18}`}
                />
                {errors[name] && (
                  <small className="p-error" style={{ display: "block" }}>
                    * {errors[name]}
                  </small>
                )}
              </div>
            );
          } else if (type === "radio") {
            return (
              <div key={name} style={{ marginBottom: "1rem" }}>
                <label htmlFor={name} style={{ display: "block", marginBottom: "0.2rem" }}>
                  {label}
                </label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
                  {options.map((option) => (
                    <div key={option.value} style={{ display: "flex", alignItems: "center", marginTop: "0.3rem" }}>
                      <RadioButton
                        id={`${name}_${option.value}`}
                        name={name}
                        value={option.value}
                        onChange={(e) => handleChange(name, e.value)}
                        checked={formData[name] === option.value}
                      />
                      <label htmlFor={`${name}_${option.value}`} style={{ marginLeft: "0.5rem" }}>
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                {errors[name] && (
                  <small className="p-error" style={{ display: "block" }}>
                    * {errors[name]}
                  </small>
                )}
              </div>
            );
          } else {
            return (
              <div key={name} style={{ marginBottom: "1rem" }}>
                <label htmlFor={name} style={{ display: "block", marginBottom: "0.2rem" }}>
                  {label}
                </label>
                <InputText
                  id={name}
                  type={type}
                  value={formData[name]}
                  style={{ width: "98%" }}
                  placeholder={`Enter your ${label}`}
                  onChange={(e) => handleChange(name, e.target.value)}
                  className={errors[name] ? "p-invalid" : ""}
                />
                {errors[name] && (
                  <small className="p-error" style={{ display: "block" }}>
                    * {errors[name]}
                  </small>
                )}
              </div>
            );
          }
        })}

        <Toast ref={toast} position="top-center" />
        <Button type="submit" label="Submit" />
      </form>
    </div>
  );
};

export default DynamicForm;
