import '../styles/home.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAlphaNum } from '../utils/validation.js';


export default function Home() {
    const [pseudo, setPseudo] = useState("");
    const [room, setRoom] = useState("");

    const isDisabled = !pseudo || !room;

    const navigate = useNavigate();

    const isValid = isAlphaNum(pseudo) && isAlphaNum(room);

    const handleJoin = () => {
        const cleanPseudo = pseudo.trim();
        const cleanRoom = room.trim();

        navigate(`/${cleanRoom}/${cleanPseudo}`);
    };

    

  return (


    <div class="form-page">
        <section class="form-card">
            <div class="form-inner">
                <center>
                    <header class="form-header">
                        <h1 class="form-title">Red Tetris</h1>
                    </header>
                </center>

                <form class="form-grid" method="post" onReset={() => {setPseudo("");setRoom("");}} onSubmit={(e) => {e.preventDefault();handleJoin();}}>
                    <div class="label">
                        <div class="field">
                            <label className="label">Pseudo</label>
                            <div class="control">
                                <input placeholder='Antwane' className="input" value={pseudo} onChange={(value) => setPseudo(value.target.value)}/>
                            </div>
                        </div>
                    </div>

                    <div class="field">
                        <label className="label" for="Room">Room code</label>
                        <div class="control">
                            <input placeholder='Room code' className="input" value={room} onChange={(value) => setRoom(value.target.value)}/>
                        </div>
                        <div class="hint">If want to play with random tape 'random'</div>
                    </div>
                    {room && pseudo && !isValid && (
                        <p className="error">
                            Pseudo and Room code should only contain alphanumeric characters.
                        </p>
                    )}

                    <div class="form-actions">
                        <button class="btn btn-secondary" type="reset">Reset</button>
                        <button className="btn btn-primary" type="submit" disabled={!pseudo || !room || !isValid}>Join</button>
                    </div>
                </form>
            </div>
        </section>
    </div>

  );
}
