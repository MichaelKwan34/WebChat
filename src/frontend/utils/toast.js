let activeToast = null;

export function showToast(message, type = "success") {
  let toastBG;

  switch (type) {
    case "success":
      toastBG = "#499167"
      break;

    case "error":
      toastBG = "#B31D34"
      break;
  }

  if (activeToast) {
    activeToast.hideToast();
    activeToast = null;
  }

  activeToast = Toastify({
    text: message,
    duration: 2500,
    gravity: "top",
    position: "center",
    style: {
      background: toastBG,
      color: "#e7ecef",
      borderRadius: "18px",
      padding: "14px 18px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.18)",
      fontSize: "1em",
      fontWeight: "bold",
      userSelect: "none",
      pointerEvents: "none"
    },
    onClose: () => {
      activeToast = null;
    }
  });

  activeToast.showToast();
}