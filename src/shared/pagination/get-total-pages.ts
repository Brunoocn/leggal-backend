interface IGetTotalPages {
  total: number;
  pageSize: number;
}

export const getTotalPages = ({ total, pageSize }: IGetTotalPages) => {
  return total > 0 ? Math.ceil(total / pageSize) : 1;
};
