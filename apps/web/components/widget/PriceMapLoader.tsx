"use client";
import dynamic from "next/dynamic";
const PriceMapWidget = dynamic(() => import("./PriceMapWidget"), { ssr: false });
export default PriceMapWidget;
