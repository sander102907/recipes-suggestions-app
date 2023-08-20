import { Button, Spinner } from "react-bootstrap";
import "./loadButton.css";

const LoadButton = (props) => {
  return (
    <Button variant="primary" disabled={props.loading} onClick={props.onClick}>
      {props.loading ? (
        <Spinner
          className="spinner"
          as="span"
          animation="grow"
          size="sm"
          role="status"
          aria-hidden="true"
        />
      ) : null}
      {props.loading ? props.loadText : props.text}
    </Button>
  );
};

export default LoadButton;
