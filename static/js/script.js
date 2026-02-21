// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("predictionForm");
  const predictBtn = document.getElementById("predictBtn");
  const resultsSection = document.getElementById("resultsSection");
  const predictionValue = document.getElementById("predictionValue");

  // Format currency function
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Parse currency string to number
  const parseCurrency = (value) => {
    return parseFloat(value) || 0;
  };

  // Update input summary
  const updateSummary = () => {
    const rd = parseCurrency(document.getElementById("rd_spend").value);
    const admin = parseCurrency(
      document.getElementById("administration").value,
    );
    const marketing = parseCurrency(
      document.getElementById("marketing_spend").value,
    );
    const stateSelect = document.getElementById("state");
    const state = stateSelect.options[stateSelect.selectedIndex]?.text || "-";

    document.getElementById("summaryRd").textContent = formatCurrency(rd);
    document.getElementById("summaryAdmin").textContent = formatCurrency(admin);
    document.getElementById("summaryMarketing").textContent =
      formatCurrency(marketing);
    document.getElementById("summaryState").textContent = state;

    const total = rd + admin + marketing;
    document.getElementById("totalSpend").textContent = formatCurrency(total);
  };

  // Add input listeners for real-time updates
  ["rd_spend", "administration", "marketing_spend", "state"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", updateSummary);
      element.addEventListener("change", updateSummary);
    }
  });

  // Handle form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Show loading state
    predictBtn.classList.add("loading");
    predictBtn.disabled = true;

    // Get form data
    const rd_spend = document.getElementById("rd_spend").value;
    const administration = document.getElementById("administration").value;
    const marketing_spend = document.getElementById("marketing_spend").value;
    const state = document.getElementById("state").value;

    // Validate form
    if (!rd_spend || !administration || !marketing_spend || !state) {
      showError("Please fill in all fields");
      predictBtn.classList.remove("loading");
      predictBtn.disabled = false;
      return;
    }

    // Validate numeric values
    if (isNaN(rd_spend) || isNaN(administration) || isNaN(marketing_spend)) {
      showError("Please enter valid numbers");
      predictBtn.classList.remove("loading");
      predictBtn.disabled = false;
      return;
    }

    const formData = {
      rd_spend: rd_spend,
      administration: administration,
      marketing_spend: marketing_spend,
      state: state,
    };

    console.log("Sending data:", formData);

    try {
      // Make API call
      const response = await fetch("/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        // Update prediction
        if (predictionValue) {
          predictionValue.textContent =
            data.formatted || formatCurrency(data.prediction);
        }

        // Show results with animation
        resultsSection.classList.add("visible");

        // Scroll to results smoothly
        setTimeout(() => {
          resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }, 100);

        // Show success message
        showSuccess("Prediction generated successfully!");
      } else {
        showError(data.error || "An error occurred while predicting");
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Network error. Please check if the server is running.");
    } finally {
      // Remove loading state
      predictBtn.classList.remove("loading");
      predictBtn.disabled = false;
    }
  });

  // Show error message
  function showError(message) {
    // Remove any existing error messages
    const existingError = document.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    form.insertBefore(errorDiv, form.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Show success message
  function showSuccess(message) {
    // Remove any existing success messages
    const existingSuccess = document.querySelector(".success-message");
    if (existingSuccess) {
      existingSuccess.remove();
    }

    const successDiv = document.createElement("div");
    successDiv.className = "success-message";
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;

    form.insertBefore(successDiv, form.firstChild);

    // Auto remove after 3 seconds
    setTimeout(() => {
      successDiv.remove();
    }, 3000);
  }

  // Add input animation
  const inputs = document.querySelectorAll("input, select");
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentElement.classList.add("focused");
    });

    input.addEventListener("blur", function () {
      this.parentElement.classList.remove("focused");
    });
  });

  // Initialize with default values
  updateSummary();

  // Add tooltips for better UX
  const tooltips = {
    rd_spend: "Investment in research and development activities",
    administration: "Costs for administration and operations",
    marketing_spend: "Budget allocated for marketing and advertising",
    state: "Location of your business operations",
  };

  // Add tooltip icons
  Object.keys(tooltips).forEach((id) => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      const tooltipIcon = document.createElement("i");
      tooltipIcon.className = "fas fa-info-circle tooltip-icon";
      tooltipIcon.title = tooltips[id];
      label.appendChild(tooltipIcon);
    }
  });

  // Add keyboard shortcut (Enter to submit)
  form.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !predictBtn.disabled) {
      e.preventDefault();
      form.dispatchEvent(new Event("submit"));
    }
  });

  // Add reset button functionality
  const resetBtn = document.querySelector(".reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      updateSummary();
      resultsSection.classList.remove("visible");

      // Reset prediction value
      if (predictionValue) {
        predictionValue.textContent = "$0.00";
      }
    });
  }

  // Add default values for testing (optional - uncomment to use)
  const setDefaultValues = () => {
    document.getElementById("rd_spend").value = "165349.30";
    document.getElementById("administration").value = "136897.90";
    document.getElementById("marketing_spend").value = "471784.20";
    document.getElementById("state").value = "new york";
    updateSummary();
  };

  // Uncomment the line below to set default values for testing
  // setDefaultValues();
});

// Add smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Add parallax effect to background circles
window.addEventListener("mousemove", function (e) {
  const circles = document.querySelectorAll(".gradient-circle");
  const mouseX = e.clientX / window.innerWidth;
  const mouseY = e.clientY / window.innerHeight;

  circles.forEach((circle, index) => {
    const speed = 20 * (index + 1);
    const x = (window.innerWidth * 0.5 - mouseX * window.innerWidth) / speed;
    const y = (window.innerHeight * 0.5 - mouseY * window.innerHeight) / speed;
    circle.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// Add weather widget functionality (optional)
const addWeatherWidget = () => {
  const weatherWidget = document.createElement("div");
  weatherWidget.className = "weather-widget";
  weatherWidget.innerHTML = `
        <i class="fas fa-cloud-sun weather-icon"></i>
        <div>
            <div class="weather-temp">27°C</div>
            <div class="weather-desc">Mostly cloudy</div>
        </div>
    `;
  document.body.appendChild(weatherWidget);
};

// Uncomment to add weather widget
// addWeatherWidget();
