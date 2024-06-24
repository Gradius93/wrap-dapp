import {withStyles} from "@material-ui/core";
import {createStyles} from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";

const FarmingStyledTableRow = withStyles(() =>
    createStyles({
        root: {
            margin: '50px',

            border: '2px solid red'
        }
    })
)(TableRow);

export default FarmingStyledTableRow;