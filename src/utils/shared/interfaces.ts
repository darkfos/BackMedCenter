export interface IPagination<T> {
    list: Array<T>;
    pagination: {
        page: number;
        pageSize: number;
        total: number;
    }
}