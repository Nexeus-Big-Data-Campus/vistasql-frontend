import { Link } from "react-router-dom";
import Header from "../components/Header";


export default function Home() {
    return (
        <main>
            <Header/>

            <section className= 'flex flex-col items-center justify-center h-screen'>
                <h1 className='text-4xl font-bold'>Hola Mundo</h1>

                <Link to="/editor" className='bg-blue-500 text-white px-4 py-2 '>
                    Ir a Editor
                </Link>
            </section>

        </main>
    );
}
