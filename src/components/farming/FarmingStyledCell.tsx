import {withStyles} from "@material-ui/core";
import {createStyles} from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";

const FarmingStyledTableCell = withStyles(() =>
    createStyles({
        head: {
            backgroundColor: '#e5e5e5',
            color: 'black',
            padding: '0px',
            fontWeight: 'bold'
        },
        body: {
            fontSize: 14,
            padding: '20px',
            backgroundColor: 'white',
            textAlign: 'center',
            '&:first-child': {
                borderRadius: '20px 0 0 20px'
            },
            '&:last-child': {
                borderRadius: '0 20px 20px 0',
                padding: '0px 0px',
                flex: 2
            }
        }
    })
)(TableCell);

export default FarmingStyledTableCell;