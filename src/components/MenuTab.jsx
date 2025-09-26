import { useMenuTabTaskHandler } from "../hooks/useMenuTabTaskHandler";

export const MenuTab = (props) => {
  const handleMenuClick = useMenuTabTaskHandler();

  return (
    <div className="dropdown dropdown-start">
      <div tabIndex={0} role="button" className="btn btn-info h-[2.8vh]">{props.tabname}</div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2">
        {props.menu.map((menuname) => (
          <li key={menuname.name}>
            <a onClick={() => handleMenuClick(menuname.name)}>{menuname.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};