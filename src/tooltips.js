
export class Tooltips {
  constructor($holder) {
    if($holder === undefined) {
      throw new Error('Holder for tooltips is undefined');
    }
    this._$holder = $holder.append('<div class=""></div>');
    //this.
  }

  // expects array of { html, x, y }
  setTooltips(objs) {
    objs.each(o => {
      var tooltip = this._$holder.append();
    });
  }

  detach() {

  }
};

