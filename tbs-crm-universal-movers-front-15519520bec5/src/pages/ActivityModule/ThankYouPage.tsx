import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";

const ThankYouPage: React.FC = () => {
  const [showBox, setShowBox] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBox(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        position: "relative",
        bgcolor: "#282c34",
        overflow: "hidden",
        p: 3,
      }}
    >
      {/* Animated Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            width: "150%",
            height: "150%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.2), transparent)",
            animation: "rotate 12s linear infinite",
            zIndex: 0,
          },
          "&::before": {
            top: "-50%",
            left: "-50%",
            animationDirection: "normal",
          },
          "&::after": {
            top: "25%",
            left: "25%",
            animationDirection: "reverse",
          },
          "@keyframes rotate": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />

      {/* Thank You Message Box */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          bgcolor: "rgba(255, 255, 255, 0.9)",
          color: "#333",
          p: 6,
          borderRadius: "10px",
          boxShadow: "0px 16px 32px rgba(0, 0, 0, 0.1)",
          maxWidth: "800px",
          width: "90%",
          transform: showBox ? "translateY(0)" : "translateY(100%)",
          opacity: showBox ? 1 : 0,
          transition: "transform 0.8s ease, opacity 0.8s ease",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{
            background: "linear-gradient(90deg, #ff7eb3, #ff758c, #feb47b)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          🎉 Thank You! 🎉
        </Typography>
        <Typography
          variant="body1"
          gutterBottom
          sx={{
            mb: 4,
            fontWeight: 500,
          }}
        >
          Your quotation has been successfully accepted! You’ll be redirected
          to the homepage
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: "#ff4081",
            color: "#fff",
            "&:hover": { bgcolor: "#f50057" },
            px: 4,
            py: 2,
            fontSize: "1rem",
          }}
          onClick={() => alert("Redirecting to Home!")}
        >
          Go to Website
        </Button>
      </Box>
    </Box>
  );
};

export default ThankYouPage;
