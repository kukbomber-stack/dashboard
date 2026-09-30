import { meta } from "@/lib/data";
import LogoutButton from "./LogoutButton";
import PrintMenu from "./PrintMenu";
import RatesTicker from "./RatesTicker";


export default function Topbar({ noPrint = false }: { title?: string; noPrint?: boolean }) {
  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginLeft: "auto" }}>
        <RatesTicker />
        <span className="as">производство на <b>{meta.asOfProd}</b> · финансы на <b>{meta.asOfFin}</b></span>
        <PrintMenu hidePrintSelf={noPrint} />
        <LogoutButton />
      </div>
    </div>
  );
}
