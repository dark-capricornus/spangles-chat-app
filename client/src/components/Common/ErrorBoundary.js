import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Paper sx={{ p: 4, maxWidth: 600, mx: "auto" }}>
            <Typography variant="h4" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              We encountered an error while loading this page. Please try
              refreshing or contact support if the problem persists.
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mr: 2 }}
            >
              Refresh Page
            </Button>
            <Button
              variant="outlined"
              onClick={() =>
                this.setState({ hasError: false, error: null, errorInfo: null })
              }
            >
              Try Again
            </Button>

            {process.env.NODE_ENV === "development" && (
              <Box sx={{ mt: 3, textAlign: "left" }}>
                <Typography variant="h6" gutterBottom>
                  Error Details (Development Mode):
                </Typography>{" "}
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    p: 2,
                    borderRadius: 1,
                    overflow: "auto",
                    fontSize: "0.875rem",
                  }}
                >
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
