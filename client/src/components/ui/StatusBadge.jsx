const StatusBadge = ({ status }) => {
  let label = "";
  let className = "";

  switch (status) {
    case "active":
      label = "Active";
      className = "badge-success";
      break;
    case "suspended":
      label = "Suspended";
      className = "badge-danger";
      break;
    case "expired":
      label = "Expired";
      className = "badge-warning"; // yellow, or any style you want
      break;
    case "none":
    default:
      label = "None";
      className = "badge-muted"; // gray
  }

  return <span className={`badge ${className}`}>{label}</span>;
};

export default StatusBadge;
