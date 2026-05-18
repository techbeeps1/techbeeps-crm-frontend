import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNewsItemsEditedData } from '../../Redux/formSlice';
import { resetForm, setFormField } from '../../Redux/formSlice';

function EditNewsItem({
  newsItemData,
  handleEditSubmit,
  handleCloseEditForm,
  deleteNewsItem,
}: any) {
  const dispatch = useDispatch();
  const newsItemsForm = 'newsItems';
  // Use useSelector to get the updated state
  const newsItemEditedData = useSelector(
    (state: any) => state.forms[newsItemsForm],
  );

  useEffect(() => {
    const updateEditedData = async () => {
      if (newsItemData) {
        dispatch(
          setFormField({
            formName: newsItemsForm,
            field: 'editedData',
            value: newsItemData,
          }),
        );
      }
    };
    updateEditedData();
  }, [dispatch, newsItemData, newsItemsForm]);

  useEffect(() => {
    const today = new Date().getDay();
    const reqDateVar = new Date(newsItemEditedData?.editedData?.publishAt).getDay();

    if(today === reqDateVar){
     console.log("equal")
    } else {
     console.log("notEqual",reqDateVar)
    }
  }, [newsItemEditedData]);

  const handleNewsItemFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setNewsItemsEditedData({
        ...newsItemEditedData.editedData,
        [name]: value,
      }),
    );
    console.log(name, value);
  };

  // Handle form submission
  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();
    try {
      await handleEditSubmit(newsItemEditedData?.editedData);
      dispatch(resetForm({ formName: newsItemsForm }));
    } catch (error) {
      // Handle errors (e.g., show an error message to the user)
      console.error('Error during form submission:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className='text-center p-1'>{ !newsItemData?.publishAt ? 'Not yet published' : 'Published on '+ new Date(newsItemData?.publishAt)}</h1>
      <div className="mb-4.5 ml-1">
        <label className="mb-2.5 ml-2 block text-black dark:text-white">
          New news item
        </label>
        <div className="relative z-20 bg-transparent dark:bg-form-input">
          <input
            type="text"
            placeholder="New Item"
            className="w-full xl:w-[18rem] ml-2 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            name="title"
            value={
              (newsItemEditedData &&
                newsItemEditedData.editedData &&
                newsItemEditedData.editedData.title) ||
              ''
            }
            onChange={handleNewsItemFormChange}
          />
        </div>
      </div>
      <textarea
        id="chat"
        className="block mx-4 p-2.5 w-full xl:w-[18rem] h-100 text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        name="body"
        value={
          (newsItemEditedData &&
            newsItemEditedData.editedData &&
            newsItemEditedData.editedData.body) ||
          ''
        }
        onChange={handleNewsItemFormChange}
        required
      ></textarea>
      <div className="flex justify-center p-2">
      <div>
        <div>
          <label className="mb-2.5 block text-black dark:text-white">
            Publish on
          </label>
          <div className="relative z-20 bg-transparent dark:bg-form-input">
            <input
              type="date"
              placeholder="New Item"
              className="w-50 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              name="publishAt"
              value={
                (new Date(newsItemEditedData && newsItemEditedData.editedData &&
                  newsItemEditedData.editedData.publishAt)?.toJSON()?.split("T")[0]) ||
                ''
              }
              disabled
              onChange={handleNewsItemFormChange}
            />
          </div>
        </div>

        <button
          className="bg-blue-200 text-black active:bg-blue-500 mt-9
       font-bold px-6 py-3 ml-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
          type="button"
          onClick={() => deleteNewsItem(newsItemData._id)}
        >
          Delete message
        </button>
        </div><br />

        <div>
        <button
          className="bg-blue-200 text-black active:bg-blue-500 mt-9
       font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
          type="submit"
        >
          Save changes
        </button>
        <button
          className="bg-blue-200 text-black active:bg-gray-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
          onClick={() => {
            handleCloseEditForm();
          }}
        >
          &times; Close
        </button>
        </div>
      </div>
    </form>
  );
}

export default EditNewsItem;
