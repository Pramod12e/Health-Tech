import { useTranslation } from "react-i18next";
import { MenuItem, Select } from "@mui/material";

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Select
      value={i18n.language}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      size="small"
      sx={{ color: "black", marginleft: "auto"}}
      defaultValue="English"
      
    >
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="hi">हिंदी</MenuItem>
      <MenuItem value="or">ଓଡ଼ିଆ</MenuItem>
    </Select>
  );
}
export default LanguageSwitcher;