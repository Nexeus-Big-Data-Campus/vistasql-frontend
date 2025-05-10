import { Link } from "react-router";
import Header from "../components/Header";

export default function Home() {
    return (
        <>
            <Header/>
            <section className="flex flex-col items-center justify-center h-1/4">
                <Link to="/editor" className="bg-blue-500 rounded text-white px-4 py-2">
                    Ir a Editor
                </Link>
            </section>
        </>
    );
}
