import create from 'zustand';

const useStore = create((set) => ({
  threeL: 0,
  threeM: 0,
  threeS: 0,
  fiveL: 0,
  fiveM: 0,
  fiveS: 0,
  tenL: 0,
  tenM: 0,
  tenS: 0,
  twentyL: 0,
  twentyM: 0,
  twentyS: 0,
  threeadd(이름, 숫자) {
    set((state) => ({ 이름: state.count + 숫자 }));
  },
}));

export default useStore;
