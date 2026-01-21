import { useParams } from "react-router-dom";
import '../styles/home.css';

export default function Room() {
  const { room, pseudo } = useParams();

  return (
    <div>
      Room : {room} <br />
      Pseudo : {pseudo}
    </div>
  );
}
