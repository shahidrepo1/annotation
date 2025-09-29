import Folder from "../components/uiComponents/Folder";

function Temp() {
  return (
    <div className="flex gap-8">
      <div className="w-32">
        <Folder
          name="Imran Khan"
          isChecked={true}
          onCheckboxChange={() => {}}
          count={100}
          onFolderClick={() => {}}
        />
      </div>
      <div className="w-32">
        <Folder
          name="Imran Khan"
          isChecked={false}
          onCheckboxChange={() => {}}
          count={100}
          onFolderClick={() => {}}
        />
      </div>
      <div className="w-32">
        <Folder
          name="Imran Khan"
          isChecked={true}
          onCheckboxChange={() => {}}
          count={100}
          onFolderClick={() => {}}
        />
      </div>
      <div className="w-32">
        <Folder
          name="Imran Khan"
          isChecked={true}
          onCheckboxChange={() => {}}
          count={100}
          onFolderClick={() => {}}
        />
      </div>
      <div className="w-32">
        <Folder
          name="Imran Khan"
          isChecked={true}
          onCheckboxChange={() => {}}
          count={100}
          onFolderClick={() => {}}
        />
      </div>
    </div>
  );
}

export default Temp;
