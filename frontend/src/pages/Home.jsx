
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import {
  ArrowForward,
  CheckCircle,
  ExpandMore,
  HealthAndSafety,
  MedicalServices,
  PersonSearch,
  VideoCall,
} from "@mui/icons-material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Home.css";

const doctors = [
  {
    name: "Dr. Rajesh Kumar",
    specialtyKey: "doctorSpecialty1",
    experience: "8+",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    name: "Dr. Ananya Das",
    specialtyKey: "doctorSpecialty2",
    experience: "6+",
    image:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    name: "Dr. Suresh Mohanty",
    specialtyKey: "doctorSpecialty3",
    experience: "15+",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=600&h=800&q=80",
  },
  {
    name: "Dr. Priyanka Rout",
    specialtyKey: "doctorSpecialty4",
    experience: "7+",
    image:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&h=800&q=80",
  },
];

const services = [
  { number: "01", tagKey: "serviceTag1", icon: <PersonSearch />, titleKey: "serviceTitle1", textKey: "serviceText1" },
  { number: "02", tagKey: "serviceTag2", icon: <VideoCall />, titleKey: "serviceTitle2", textKey: "serviceText2" },
  { number: "03", tagKey: "serviceTag3", icon: <HealthAndSafety />, titleKey: "serviceTitle3", textKey: "serviceText3" },
  { number: "04", tagKey: "serviceTag4", icon: <MedicalServices />, titleKey: "serviceTitle4", textKey: "serviceText4" },
];

const steps = [
  { number: "01", titleKey: "stepTitle1", textKey: "stepText1" },
  { number: "02", titleKey: "stepTitle2", textKey: "stepText2" },
  { number: "03", titleKey: "stepTitle3", textKey: "stepText3" },
  { number: "04", titleKey: "stepTitle4", textKey: "stepText4" },
];

const faqs = [
  { questionKey: "faqQuestion1", answerKey: "faqAnswer1" },
  { questionKey: "faqQuestion2", answerKey: "faqAnswer2" },
  { questionKey: "faqQuestion3", answerKey: "faqAnswer3" },
  { questionKey: "faqQuestion4", answerKey: "faqAnswer4" },
  { questionKey: "faqQuestion5", answerKey: "faqAnswer5" },
  { questionKey: "faqQuestion6", answerKey: "faqAnswer6" },
];

const heroSlides = [
  {
    titleKey: "heroSlide1",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=85",
    altKey: "heroAlt1",
  },
  {
    titleKey: "heroSlide2",
    image: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1200&q=85",
    altKey: "heroAlt2",
  },
  {
    titleKey: "heroSlide3",
    image: "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?auto=format&fit=crop&w=1200&q=85",
    altKey: "heroAlt3",
  },
  {
    titleKey: "heroSlide4",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=85",
    altKey: "heroAlt4",
  },
];

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box className="home-page">
      {/* HERO SECTION */}
      <section className="home-hero">
        <div className="hero-background-image" />
        <div className="hero-background-overlay" />

        <Container maxWidth="xl" className="hero-container">
          <Grid container className="hero-grid" alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="hero-content">
                <Box className="hero-eyebrow">
                  <CheckCircle />
                  <span>{t("trustedHealthcareFromHome")}</span>
                </Box>

                <Typography component="h1" className="hero-title">
                  {t("goodDoctor")}
                  <span>{t("CloseToFamily")}</span>
                </Typography>

                <Typography className="hero-description">
                  {t("descLing")}
                </Typography>

                <Box className="hero-trust">
                  <Box className="hero-trust-item">
                    <CheckCircle />
                    <span>{t("verifiedDoctors")}</span>
                  </Box>
                  <Box className="hero-trust-item">
                    <CheckCircle />
                    <span>{t("privateSecure")}</span>
                  </Box>
                  <Box className="hero-trust-item">
                    <CheckCircle />
                    <span>{t("videoConsultation")}</span>
                  </Box>
                </Box>

                <Box className="hero-buttons">
                  <Button
                    variant="contained"
                    className="hero-primary-btn"
                    onClick={() => navigate("/doctors")}
                    endIcon={<ArrowForward />}
                  >
                    {t("findDoctor")}
                  </Button>

                  <Button
                    variant="outlined"
                    className="hero-secondary-btn"
                    onClick={() =>
                      document
                        .getElementById("how-it-works")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    {t("howItWorks")}
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box className="hero-doctor-area">
                <Box className="hero-carousel">
                  {heroSlides.map((slide, index) => (
                    <img
                      key={slide.titleKey}
                      src={slide.image}
                      alt={t(slide.altKey)}
                      className={`hero-carousel-image ${
                        index === heroSlide ? "is-active" : ""
                      }`}
                    />
                  ))}

                  <Box className="hero-carousel-top">
                    <Box className="hero-carousel-label">
                      <span className="hero-carousel-dot" />
                      {t(heroSlides[heroSlide].titleKey)}
                    </Box>

                    <Box className="hero-carousel-dots">
                      {heroSlides.map((slide, index) => (
                        <button
                          key={slide.titleKey}
                          type="button"
                          aria-label={t("showSlide", {
                            title: t(slide.titleKey),
                          })}
                          aria-current={
                            index === heroSlide ? "true" : undefined
                          }
                          className={`hero-carousel-dot-button ${
                            index === heroSlide ? "is-active" : ""
                          }`}
                          onClick={() => setHeroSlide(index)}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box className="hero-carousel-bottom">
                    <Box className="hero-carousel-copy">
                      <strong>{t(heroSlides[heroSlide].titleKey)}</strong>
                      <span>{t("carouselFamilyCopy")}</span>
                    </Box>

                    <Box className="hero-carousel-progress">
                      <span
                        key={heroSlide}
                        style={{ animationDuration: "5000ms" }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* HERO STATISTICS */}
        <div className="hero-stats-bar">
          <Container maxWidth="xl">
            <Grid container className="hero-stats-grid">
              <Grid size={{ xs: 6, md: 3 }}>
                <Box className="hero-stat-item">
                  <Typography className="hero-stat-number">10+</Typography>
                  <Typography className="hero-stat-label">
                    {t("typesOfDoctors")}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box className="hero-stat-item">
                  <Typography className="hero-stat-number">350+</Typography>
                  <Typography className="hero-stat-label">
                    {t("verifiedDoctors")}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box className="hero-stat-item">
                  <Typography className="hero-stat-number">24/7</Typography>
                  <Typography className="hero-stat-label">
                    {t("alwaysAvailable")}
                  </Typography>
                </Box>
              </Grid>

              <Grid size={{ xs: 6, md: 3 }}>
                <Box className="hero-stat-item">
                  <Typography className="hero-stat-number">100%</Typography>
                  <Typography className="hero-stat-label">
                    {t("madeForFamilies")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services-section">
        <Container maxWidth="xl">
          <div className="services-heading">
            <Typography className="services-eyebrow">
              {t("careThatComesToYou")}
            </Typography>

            <Typography component="h2" className="services-title">
              {t("everydayHealthcare")}
              <span>{t("madeSimpler")}</span>
            </Typography>

            <Typography className="services-description">
              {t("servicesDescription")}
            </Typography>
          </div>

          <div className="services-grid">
            {services.map((service, index) => (
              <Card
                className={`service-card ${
                  index === 0 ? "service-card-featured" : ""
                }`}
                key={service.titleKey}
              >
                <CardContent className="service-card-content">
                  <div className="service-card-header">
                    <div className="service-icon">{service.icon}</div>
                    <span className="service-number">{service.number}</span>
                  </div>

                  <span className="service-tag">{t(service.tagKey)}</span>

                  <Typography component="h3" className="service-title">
                    {t(service.titleKey)}
                  </Typography>

                  <Typography className="service-text">
                    {t(service.textKey)}
                  </Typography>

                  <Button
                    className="service-link"
                    onClick={() => navigate("/doctors")}
                    endIcon={<ArrowForward />}
                  >
                    {t("exploreCare")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="services-bottom-note">
            <div className="services-note-icon">
              <CheckCircle />
            </div>

            <div className="services-note-copy">
              <strong>{t("builtAroundFamily")}</strong>
              <span>{t("familyNote")}</span>
            </div>

            <div className="services-note-stats">
              <div className="services-note-stat">
                <strong>4</strong>
                <span>{t("coreServices")}</span>
              </div>
              <div className="services-note-stat">
                <strong>24/7</strong>
                <span>{t("accessToCare")}</span>
              </div>
              <div className="services-note-stat">
                <strong>14+</strong>
                <span>{t("citiesSupported")}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* DOCTORS SECTION */}
      <section className="doctors-section">
        <Container maxWidth="xl">
          <Box className="doctors-heading">
            <Box className="doctors-heading-content">
              <Typography className="section-eyebrow">
                {t("ourDoctors")}
              </Typography>

              <Typography component="h2" className="section-title">
                {t("meetTrustedDoctors")}
              </Typography>

              <Typography className="section-description">
                {t("doctorSectionDescription1")}{" "}
                {t("doctorSectionDescription2")}
              </Typography>
            </Box>

            <Button
              className="view-doctors-btn"
              onClick={() => navigate("/doctors")}
              endIcon={<ArrowForward />}
            >
              {t("seeAllDoctors")}
            </Button>
          </Box>

          <Grid container spacing={3} className="doctors-grid">
            {doctors.map((doctor) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                key={doctor.name}
              >
                <Card className="doctor-home-card">
                  <Box className="doctor-image-wrapper">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      loading="lazy"
                    />
                  </Box>

                  <CardContent className="doctor-card-content">
                    <Typography className="doctor-name">
                      {doctor.name}
                    </Typography>

                    <Typography className="doctor-specialty">
                      {t(doctor.specialtyKey)}
                    </Typography>

                    <Typography className="doctor-experience">
                      {t("yearsExperience", {
                        years: doctor.experience,
                      })}
                    </Typography>

                    <Button
                      className="doctor-details-btn"
                      onClick={() => navigate("/doctors")}
                    >
                      {t("viewProfile")}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <Container maxWidth="xl">
          <Box className="how-header">
            <Typography className="how-eyebrow">
              {t("howItWorks")}
            </Typography>

            <Typography component="h2" className="how-title">
              {t("fourSteps")}
            </Typography>
          </Box>

          <Grid container spacing={3} className="how-grid">
            {steps.map((step) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                key={step.number}
              >
                <Box className="step-card">
                  <Box className="step-top-line" />

                  <Typography className="step-number">
                    {step.number}
                  </Typography>

                  <Typography className="step-title">
                    {t(step.titleKey)}
                  </Typography>

                  <Typography className="step-text">
                    {t(step.textKey)}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* PATIENT STORIES */}
      <section className="stories-section">
        <Container maxWidth="xl">
          <Box className="stories-header">
            <Typography className="stories-eyebrow">
              {t("whatFamiliesSay")}
            </Typography>

            <Typography className="stories-description">
              {t("storiesDescription1")}{" "}
              {t("storiesDescription2")}
            </Typography>
          </Box>

          <Grid container spacing={3} className="stories-grid">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="story-card">
                <Box className="story-top-line" />
                <Box className="story-avatar">A</Box>
                <Typography className="story-text">
                  {t("story1Text")}
                </Typography>
                <Typography className="story-name">
                  {t("story1Name")}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="story-card">
                <Box className="story-top-line" />
                <Box className="story-avatar">R</Box>
                <Typography className="story-text">
                  {t("story2Text")}
                </Typography>
                <Typography className="story-name">
                  {t("story2Name")}
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box className="story-card">
                <Box className="story-top-line" />
                <Box className="story-avatar">S</Box>
                <Typography className="story-text">
                  {t("story3Text")}
                </Typography>
                <Typography className="story-name">
                  {t("story3Name")}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <Container maxWidth="lg">
          <Box className="section-heading centered-heading">
            <Typography className="section-eyebrow">
              {t("commonQuestions")}
            </Typography>

            <Typography component="h2" className="section-title">
              {t("simpleAnswers")}
            </Typography>

            <Typography className="section-description">
              {t("faqIntro")}
            </Typography>
          </Box>

          <Box className="faq-list">
            {faqs.map((faq, index) => (
              <Accordion
                key={index}
                className="faq-item"
                disableGutters
                elevation={0}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className="faq-question-wrap"
                >
                  <Typography className="faq-question">
                    {t(faq.questionKey)}
                  </Typography>
                </AccordionSummary>

                <AccordionDetails className="faq-answer-wrap">
                  <Typography className="faq-answer">
                    {t(faq.answerKey)}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </section>
    </Box>
  );
}

export default Home;
