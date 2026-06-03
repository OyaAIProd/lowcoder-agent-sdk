import type { DefaultSize } from "../types.js";

export interface TableColumn {
  title: string;
  dataIndex: string;
  key?: string;
  isTag?: boolean;
  isLink?: boolean;
  editable?: boolean;
  width?: number;
}

export interface TableOptions {
  data: string;
  columns?: TableColumn[];
  showDownload?: boolean;
  showFilter?: boolean;
  showRefresh?: boolean;
  pagination?: boolean;
  pageSize?: number;
  hidden?: string | boolean;
}

export const TABLE_SIZE: DefaultSize = { w: 12, h: 40 };

export function tableDSL(opts: TableOptions): Record<string, unknown> {
  const columns = (opts.columns ?? []).map((col) => ({
    title: col.title,
    dataIndex: col.dataIndex,
    key: col.key ?? col.dataIndex,
    isTag: col.isTag ?? false,
    isLink: col.isLink ?? false,
    editable: col.editable ?? false,
    ...(col.width ? { width: col.width } : {}),
  }));

  return {
    data: opts.data,
    columns,
    showDataLoadSpinner: true,
    autoHeight: "fixed",
    pagination: {
      pageSize: opts.pageSize ?? 10,
      showSizeChanger: opts.pagination !== false,
    },
    toolbar: {
      showFilter: opts.showFilter !== false,
      showDownload: opts.showDownload !== false,
      showRefresh: opts.showRefresh !== false,
      columnSetting: false,
    },
    hidden: opts.hidden ?? false,
    onEvent: [],
  };
}
