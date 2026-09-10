import { DataGrid } from '@mui/x-data-grid';
import type { DataGridProps, GridValidRowModel } from '@mui/x-data-grid';
import { esES } from '@mui/x-data-grid/locales';

const defaultPaginationState = {
  pagination: { paginationModel: { pageSize: 10, page: 0 } },
};

export default function AppDataGrid<R extends GridValidRowModel>(
  props: DataGridProps<R>,
) {
  const {
    pageSizeOptions = [5, 10, 25],
    initialState = defaultPaginationState,
    disableRowSelectionOnClick = true,
    localeText = esES.components.MuiDataGrid.defaultProps.localeText,
    sx,
    ...rest
  } = props;

  return (
    <DataGrid<R>
      pageSizeOptions={pageSizeOptions}
      initialState={initialState}
      disableRowSelectionOnClick={disableRowSelectionOnClick}
      localeText={localeText}
      sx={[
        {
          height: '70vh',
          backgroundColor: 'white',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: (theme) => theme.palette.primary.light,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      {...rest}
    />
  );
}
