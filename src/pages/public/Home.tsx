import { Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import QueryDisplay, { QueryDisplayOptions } from "../../components/display/QueryDisplay";
import { useEffect, useState } from "react";
import { Query } from "../../interfaces/query";
import { DemoEditor } from "../../components/editor/DemoEditor";
import { useNavigate } from "react-router";

export default function Home() {
    const { t } = useTranslation();
    const [ demoQueryTree, setDemoQueryTree ] = useState<Query[]>([]);
    const [ demoCode, setDemoCode ] = useState<string>('');
    const [ currentExample, setCurrentExample] = useState(0);
    const navigate = useNavigate();

    const demoDisplayOpts: QueryDisplayOptions = {
        hideControls: true,
        hideMinimap: true,
        minZoom: 0.25
    }

    const demoCodeExamples: string[] = [
    `SELECT
        ro.order_id,
        ro.customer_id,
        ro.order_date,
        c.customer_name,
        oi.product_i
    FROM (
        SELECT
            o.order_id,
            o.customer_id,
            o.order_date
        FROM orders o
        WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
    ) ro
    JOIN customers c ON ro.customer_id = c.customer_id
    JOIN order_items oi ON ro.order_id = oi.order_id;
    `,
    `WITH recent_orders AS (
        SELECT
            o.order_id,
            o.customer_id,
            o.order_date
        FROM orders o
        WHERE o.order_date >= CURRENT_DATE - INTERVAL '30 days'
    ),
    order_totals AS (
        SELECT
            oi.order_id,
            SUM(oi.quantity * oi.unit_price) AS total_amount
        FROM order_items oi
        GROUP BY oi.order_id
    )
    SELECT
        c.customer_name,
        ro.order_date,
        ot.total_amount
    FROM recent_orders ro
    JOIN customers c ON ro.customer_id = c.customer_id
    JOIN order_totals ot ON ro.order_id = ot.order_id
    ORDER BY ot.total_amount DESC;
    `,
    `WITH recent_orders AS (
        SELECT
            o.order_id,
            o.customer_id,
            o.order_date
        FROM (
            SELECT *
            FROM orders
            WHERE status = 'completed'
        ) o
        WHERE o.order_date >= CURRENT_DATE - INTERVAL '90 days'
    ),
    customer_totals AS (
        SELECT
            ro.customer_id,
            SUM(oi.quantity * oi.unit_price) AS total_spent,
            COUNT(DISTINCT ro.order_id) AS orders_count
        FROM recent_orders ro
        JOIN order_items oi ON ro.order_id = oi.order_id
        GROUP BY ro.customer_id
    )
    SELECT
        c.customer_name,
        ct.total_spent,
        ct.orders_count,
        RANK() OVER (ORDER BY ct.total_spent DESC) AS spending_rank
    FROM customer_totals ct
    JOIN customers c ON ct.customer_id = c.customer_id
    WHERE ct.total_spent > 500
    ORDER BY ct.total_spent DESC;`
    ];

    const selectExample = (i: number) => {
        setDemoCode(demoCodeExamples[i]);
        setCurrentExample(i);
    }

    useEffect(() => {
        selectExample(currentExample);
    });
    
    return (
        <>
            <header id="hero-section" className="flex md:flex-row w-full min-h-[300px] bg-white pt-0 pb-6">
                <div id="title-container" className="flex flex-col align-center text-left w-full md:w-1/2 my-auto pl-2">
                    <div className="w-3/4 mx-auto">
                        <h1 className="font-bold text-[2rem] text-primary mb-1">{t("homePage.title")}</h1>
                        <h2 className="text-md">{t("homePage.subtitle")}</h2>

                        <Button variant="contained" sx={{"marginTop": "2rem"}} onClick={() => navigate('/login')} >{t("homePage.tryDemoCTA")}</Button>
                    </div>
                </div>

                <div className="hidden md:block h-full w-1/2 bg-red overflow-hidden">
                    <img src="/images/display_screenshot.png" className="min-h-[400px] w-auto rotate-[-15deg] scale-[2] lg:scale-[1.35] opacity-[0.65]"></img>
                </div>
            </header>

            <section id="demo-section" className="w-full bg-white p-4 pb-8 h-content">
                <header className="text-center py-4 mb-2">
                    <h2 className="text-[1.45rem] text-gray-600 mb-6 font-bold uppercase">Write SQL. See It Come to Life</h2>
                    <div className="flex w-1/2 sm:w-100 flex-col sm:flex-row justify-center align-center mt-4 gap-2 mx-auto">
                        {demoCodeExamples.map((_, index) => 
                            <Button variant={index === currentExample ? "contained" : "outlined"} onClick={() => selectExample(index)}>
                                {t("homePage.demoExample")} {index + 1}
                            </Button>
                        )}
                    </div>
                </header>
                <main id="demo-editor-container" className="max-w-[1080px] h-400px mx-auto flex flex-col-reverse md:flex-row align-center justify-center my-4 gap-4">
                    <div className="h-full w-full md:w-1/2">
                        <DemoEditor onQueryTreeChanged={(qt) => {setDemoQueryTree(qt)}} code={demoCode}></DemoEditor>
                    </div>
                    <div className="h-[350px] md:h-auto w-full md:w-1/2 mb-4 md:mb-0">
                        <QueryDisplay queryTree={demoQueryTree} options={demoDisplayOpts}></QueryDisplay>
                    </div>
                </main>
            </section>

            <section id="supported-languages-section" className="p-4 bg-gray-100 text-center">
                <h2 className="text-[1.45rem] text-gray-600 my-6 uppercase font-bold">Supported SQL variants</h2>
                <div className="max-w-[1080px] w-full mx-auto flex flex-col md:flex-row items-center justify-center gap-[5rem]">
                    <div className="rounded w-1/2 md:w-1/5">
                        <img src="/images/mysql_logo.png" alt="MySQL logo"></img>
                    </div>

                    <div className="rounded w-1/2 md:w-1/5">
                        <img src="/images/postgresql_logo.png" alt="PostgreSQL logo"></img>
                    </div>

                    <div className="rounded w-1/2 md:w-1/5">
                        <img src="/images/bigquery_logo.png" alt="BigQuery SQL logo"></img>
                    </div>
                </div>
            </section>
        </>
    );
}