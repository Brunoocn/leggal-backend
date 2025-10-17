interface IGetOffset {
  page: number;
  pageSize: number;
}

export const getSkip = ({ page, pageSize }: IGetOffset) => {
  return pageSize * (page - 1);
};
