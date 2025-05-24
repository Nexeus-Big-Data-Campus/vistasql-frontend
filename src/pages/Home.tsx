import { Button } from "@mui/material";

interface HomeProps {
    navigateTo: (path: string) => void;    
}
export default function Home({ navigateTo }: HomeProps) {
    return (
        <>
            <section className="flex flex-col items-center justify-center h-screen">         
               <Button variant="contained" color="primary" onClick={() => navigateTo('/editor')}>
                    ir a /editor                
                </Button>
            </section>
        </>
    );
}