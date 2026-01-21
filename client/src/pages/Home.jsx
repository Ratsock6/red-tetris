import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Page principale</h1>
      <p>Choisis une page d'exemple :</p>

        <Link to="/firstpage">Aller à Exemple 1</Link>
        <br />
        <Link to="/secondpage">Aller à Exemple 2</Link>
    </div>
  );
}
