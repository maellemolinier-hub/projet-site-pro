"use client";

import dynamic from "next/dynamic";

const MapWidget = dynamic(() => import("@/components/widget/MapWidget"), { ssr: false });

export default MapWidget;
