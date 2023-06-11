export class BasePresenter<T> {
  toPlainObj(): T {
    return Object.assign({}, this) as T;
  }
}
