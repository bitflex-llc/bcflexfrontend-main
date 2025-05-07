import { FaCheck } from "react-icons/fa";
import { ApiOpenOffer } from "../../../../api-wrapper";
import { BFGradientButton, BFGradientButtonType } from "../../../html/BFGradientButton";
import Colors from "../../../../Colors";

export function TradeRow({ row }: { row: ApiOpenOffer }) {
    return <>
        <tr style={{ padding: 4 }}>
            <td className='tdFix font-roboto-condensed'><FaCheck color={Colors.bitFlexGreenColor} /> {row.username}</td>
            <td className='tdFix font-roboto-condensed'>Google Pay</td>
            <td className='tdFix font-roboto-condensed'>{row.price} per USD</td>
            <td className='tdFix font-roboto-condensed'>{row.min} - {row.max} {row.fiatCurrencyId} INR</td>

            <td className='tdFix font-roboto-condensed'><BFGradientButton buttonType={BFGradientButtonType.GoldenBorderActionSmall} text="SELL" /></td>
        </tr>
    </>
}