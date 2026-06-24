import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNewsItemsEditedData } from '../../Redux/formSlice';
import { resetForm, setFormField } from '../../Redux/formSlice';
import { toast } from 'react-toastify';

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
  const handleSubmit = async () => {
    
    try {
      
       if(newsItemEditedData?.editedData?.title.trim() === "" || newsItemEditedData?.editedData?.body.trim() === "" ) {
            toast.error("Please fill all the fields")
            return;
          }
          if(newsItemEditedData?.editedData?.title.length < 5 || newsItemEditedData?.editedData?.title.length > 100) {
            toast.error("News title should be between 5 and 100 characters long")
            return;
          }
          if(newsItemEditedData?.editedData?.body.length > 1000 || newsItemEditedData?.editedData?.body.length < 10) {
            toast.error("News content should be between 10 and 1000 characters long")
            return;
          }


      await handleEditSubmit(newsItemEditedData?.editedData);
      dispatch(resetForm({ formName: newsItemsForm }));
    } catch (error) {
      // Handle errors (e.g., show an error message to the user)
      console.error('Error during form submission:', error);
    }
  };

  return (
 

< div
  className="bg-white p-6 relative "
>
      <button
      type="button"
      onClick={() => handleCloseEditForm()}
      className="absolute top-4 right-4 text-gray-500 text-2xl hover:text-gray-700 transition-all bg-[#f0f0f0] hover:bg-[#d0d0d0] rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      X
    </button>
  <div className="mb-6 text-center">
    <h2 className="text-2xl font-bold text-black dark:text-white">
      Edit News Item
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      {!newsItemData?.publishAt
        ? "Not yet published"
        : `Published on ${new Date(
            newsItemData.publishAt
          ).toLocaleDateString()}`}
    </p>
  </div>

  {/* Title */}
  <div className="mb-5">
    <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
      News Title
    </label>

    <input
      type="text"
      name="title"
      placeholder="News Title"
      value={
        (newsItemEditedData &&
          newsItemEditedData.editedData &&
          newsItemEditedData.editedData.title) ||
        ""
      }
      onChange={handleNewsItemFormChange}
      className="w-full rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input dark:text-white"
    />
  </div>

  {/* Content */}
  <div className="mb-5">
    <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
      News Content
    </label>

    <textarea
      id="chat"
      name="body"
      required
      value={
        (newsItemEditedData &&
          newsItemEditedData.editedData &&
          newsItemEditedData.editedData.body) ||
        ""
      }
      onChange={handleNewsItemFormChange}
      className="w-full h-50 rounded-lg border border-stroke bg-transparent p-4 outline-none transition-all resize-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-form-strokedark dark:bg-form-input dark:text-white"
    />
  </div>

  {/* Publish Date */}
  <div className="mb-6">
    <label className="mb-2 block text-sm font-semibold text-black dark:text-white">
      Publish On
    </label>

    <input
      type="date"
      name="publishAt"
      disabled
      value={
        (new Date(
          newsItemEditedData?.editedData?.publishAt
        )?.toJSON()?.split("T")[0]) || ""
      }
      onChange={handleNewsItemFormChange}
      className="w-full md:w-64 rounded-lg border border-stroke bg-transparent px-4 py-3 outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
    />
  </div>

  {/* Buttons */}
  <div className="flex flex-col sm:flex-row gap-3">
    <button
      type="button"
      onClick={() => deleteNewsItem(newsItemData._id)}
      className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-all hover:bg-red-600"
    >
      Delete Message
    </button>

    <button
      type="button"
      onClick={handleSubmit}
      className="rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
    >
      Save Changes
    </button>


  </div>
</div>




  );
}

export default EditNewsItem;
