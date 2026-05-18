const Loader = () => {
  return (
    <div className="flex h-full w-full items-center justify-center" style={{position:'absolute',top:'0', bottom:'0',left:'0',zIndex:'9999',background:'rgb(255,255,255,.2)'}}>
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
