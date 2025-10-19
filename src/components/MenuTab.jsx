import { useMenuTabTaskHandler } from "../hooks/useMenuTabTaskHandler";

export const MenuTab = (props) => {
  const handleMenuClick = useMenuTabTaskHandler();

  return (
    <div className="dropdown dropdown-start">
      <div tabIndex={0} role="button" className="px-3 py-1 text-[#4a9eff] text-sm hover:bg-[#4a9eff]/10 cursor-pointer transition-colors h-full flex items-center border-r border-[#4a9eff]/20">
        {props.tabname}
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-[#0f0f1e] rounded-md shadow-xl shadow-[#4a9eff]/20 border border-[#4a9eff]/30 z-[100] w-52 p-1 mt-1">
        {props.menu.map((menuname) => (
          <li key={menuname.name}>
            <a 
              onClick={() => handleMenuClick(menuname.name)}
              className="text-[#4a9eff] text-sm hover:bg-[#4a9eff]/20 rounded px-3 py-2 transition-colors"
            >
              {menuname.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};